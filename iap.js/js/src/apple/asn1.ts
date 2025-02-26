// Import necessary libraries
// Assuming a library like asn1.js is available
import { fromBER } from "asn1js";
import type { IAPReceiptOptions } from ".";

type Nullable<T> = { [K in keyof T]: T[K] | null };

interface IAPReceipt {
  quantity: number;
  productIdentifier: string;
  transactionIdentifier: string;
  originalTransactionIdentifier: string;
  purchaseDate: Date;
  originalPurchaseDate: Date;
  subscriptionExpirationDate: Date;
  subscriptionIntroductoryPricePeriod: number;
  cancellationDate: Date;
  webOrderLineItemID: number;
  remaining: any[];
}

function createInAppPurchaseReceipt(attributes, options: IAPReceiptOptions) {
  //console.log("---", attributes, "---");
  const receipt: Nullable<IAPReceipt> = {
    quantity: null,
    productIdentifier: null,
    transactionIdentifier: null,
    originalTransactionIdentifier: null,
    purchaseDate: null,
    originalPurchaseDate: null,
    subscriptionExpirationDate: null,
    subscriptionIntroductoryPricePeriod: null,
    cancellationDate: null,
    webOrderLineItemID: null,
    remaining: [],
  };

  for (const attr of attributes) {
    let block = (n: number) => attr.valueBlock.value[n].valueBlock;
    let value = block(2).value[0].valueBlock;
    let attributeId = block(0).valueDec;
    switch (attributeId) {
      case 1701:
        receipt.quantity = value.valueDec;
        break;
      case 1702:
        receipt.productIdentifier = value.value;
        break;
      case 1703:
        receipt.transactionIdentifier = value.value;
        break;
      case 1705:
        receipt.originalTransactionIdentifier = value.value;
        break;
      case 1704:
        receipt.purchaseDate = new Date(value.value);
        break;
      case 1706:
        receipt.originalPurchaseDate = new Date(value.value);
        break;
      case 1708:
        // todo:
        receipt.subscriptionExpirationDate;
        break;
      case 1719:
        // todo:
        receipt.subscriptionIntroductoryPricePeriod;
        break;
      case 1712:
        // todo:
        receipt.cancellationDate;
        break;
      case 1711:
        receipt.webOrderLineItemID = value.valueDec;
        break;
      default:
        if (options.returnRemaining) {
          receipt.remaining!.push(attr);
        }
        break;
    }
  }

  return receipt;
}

interface AppReceipt {
  bundleIdentifier: string;
  appVersion: string;
  opaqueValue: any;
  sha1Hash: string;
  inAppPurchaseReceipts: IAPReceipt[];
  originalApplicationVersion: string;
  receiptCreationDate: Date;
  receiptExpirationDate: Date;
  remaining: any[];
}

function createAppReceipt(attributes, options: IAPReceiptOptions) {
  const receipt: Nullable<AppReceipt> = {
    bundleIdentifier: null,
    appVersion: null,
    opaqueValue: null,
    sha1Hash: null,
    inAppPurchaseReceipts: [],
    originalApplicationVersion: null,
    receiptCreationDate: null,
    receiptExpirationDate: null,
    remaining: [],
  };

  for (const attr of attributes) {
    let block = (n: number) => attr.valueBlock.value[n].valueBlock;
    let attributeId = block(0).valueDec;
    let value = block(2);
    switch (attributeId) {
      case 2:
        receipt.bundleIdentifier = value.value[0].valueBlock.value;
        break;
      case 3:
        receipt.appVersion = value.value[0].valueBlock.value;
        break;
      case 4:
        // ArrayBuffer to hex string
        receipt.opaqueValue = Buffer.from(value.valueHex).toString("hex");
        break;
      case 5:
        receipt.sha1Hash = Buffer.from(value.valueHex).toString("hex");
        break;
      case 17:
        const result = fromBER(new Uint8Array(value.valueHex).buffer);
        if (result.offset !== -1) {
          let iapAttributes = result.result.valueBlock.value;
          const iap = createInAppPurchaseReceipt(iapAttributes, options);
          receipt.inAppPurchaseReceipts.push(iap);
        }
        break;
      case 19:
        receipt.originalApplicationVersion = value.value[0].valueBlock.value;
        break;
      case 12:
        receipt.receiptCreationDate = new Date(value.value[0].valueBlock.value);
        break;
      case 21:
        receipt.receiptExpirationDate = new Date(
          value.value[0].valueBlock.value
        );
        break;
      default:
        if (options.returnRemaining) {
          if (!receipt.remaining) {
            receipt.remaining = [];
          }
          receipt.remaining.push(attr);
          break;
        }
    }
  }

  return receipt;
}

// Export the functions for use in other modules
export { createInAppPurchaseReceipt, createAppReceipt };
