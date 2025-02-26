import { exec } from "child_process";

export async function fetchCa() {
  const response = await fetch(
    "https://www.apple.com/appleca/AppleIncRootCertificate.cer"
  );
  return Buffer.from(await response.arrayBuffer());
}

export async function getAppleRootPem(ca?: Buffer) {
  if (!ca) {
    ca = await fetchCa();
  }
  let cert = await new Promise((resolve, reject) => {
    const openssl = exec(
      "openssl x509 -inform der",
      (error, stdout, stderr) => {
        if (error) {
          reject(`OpenSSL conversion failed: ${stderr || error.message}`);
        } else {
          resolve(stdout);
        }
      }
    );

    // Pipe DER data to OpenSSL's stdin
    openssl.stdin!.write(ca);
    openssl.stdin!.end();
  });

  return (cert as string)
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");
}

if (process.argv[1] === import.meta.filename) {
  getAppleRootPem().catch(console.error);
}
