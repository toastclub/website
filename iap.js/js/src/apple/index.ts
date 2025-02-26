import * as pkijs from "pkijs";
import { fromBER } from "asn1js";
import { getAppleRootPem } from "./pem" with { type: "macro" };
import { createAppReceipt } from "./asn1";

export interface IAPReceiptOptions {
  /**
   * Remaining attributes that are undocumented by Apple.
   */
  returnRemaining?: boolean;
  /**
   * If provided, the signature will be verified using the provided certificates.
   * If set to `false`, the signature will not be verified.
   * If not provided, the signature will be verified using Apple's root certificate.
   *
   * To provide, generate compatible certificates based on the code in `pem.ts`
   * This generation can only be done in an environment with OpenSSL and `exec`,
   * so it should be done only once and the certificates should be stored.
   *
   * iap.js includes the root certificate in the bundle as that should be sufficient
   * for most use cases.
   */
  trustedCerts?: pkijs.Certificate[] | false;
}

// Function to parse and verify PKCS7 receipt
async function parsePKCS7(
  receiptBuffer: Buffer<ArrayBuffer>,
  options: IAPReceiptOptions
) {
  // Decode base64

  // Parse the ASN.1 structure
  const asn1 = fromBER(receiptBuffer.buffer);
  if (asn1.offset === -1) {
    throw new Error("Failed to parse ASN.1 structure");
  }

  // Initialize CMS ContentInfo
  const cmsContent = new pkijs.ContentInfo({ schema: asn1.result });

  // Initialize SignedData
  const signedData = new pkijs.SignedData({ schema: cmsContent.content });

  // Verify the signature
  if (options.trustedCerts !== false) {
    const verifyResult = await signedData.verify({
      signer: 0,
      trustedCerts: options.trustedCerts,
    });

    if (verifyResult === false) {
      throw new Error("Signature verification failed");
    }
  }

  // Extract the payload
  const content = signedData.encapContentInfo.eContent!.valueBlock.valueHexView;

  // Decode the ASN.1 payload
  const payloadAsn1 = fromBER(content);
  if (payloadAsn1.offset === -1) {
    throw new Error("Failed to parse ASN.1 payload");
  }

  // Extract receipt attributes
  const receiptAttributes = payloadAsn1.result.valueBlock.value;

  return createAppReceipt(receiptAttributes, options);
}

export async function decode(
  receipt: string | Buffer<ArrayBuffer>,
  options: IAPReceiptOptions = {}
) {
  if (typeof receipt === "string") {
    receipt = Buffer.from(receipt, "base64");
  }
  if (options.trustedCerts == undefined) {
    // @ts-expect-error getAppleRootPem is a macro
    let rootCert: String = getAppleRootPem();
    const certBinary = Buffer.from(rootCert, "base64");

    const asn1 = fromBER(certBinary.buffer);
    if (asn1.offset === -1) {
      throw new Error("Failed to parse certificate ASN.1 structure");
    }
    options.trustedCerts = [new pkijs.Certificate({ schema: asn1.result })];
  }

  return parsePKCS7(receipt, options);
}
