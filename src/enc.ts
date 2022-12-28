import JSEncrypt from "./jsencrypt"
import CryptoJS from "crypto-js"

const iv = CryptoJS.enc.Utf8.parse('1g3qqdh4jvbskb9x')
const publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCgfZmpLpPEpEFRKBe+ZjWJUjPe+7qg7pGqcfN3j2egJ8H2mrKwaEqZEnPnpi2O3hN8HRyaFozDOp8gwZiYfiIZjWy0Jr/FNAiiKYh5bq0GsEn+ieMmRyJg/+i1rqizhvCXvFdrdGhFTw5EBwTpsGdwe1utdlrvIJUAFWj9Yh4qbQIDAQAB"

function rsaDecrypt(cipher: string) {
  var config = { default_key_size: "1024" }
  var decrypter = new JSEncrypt(config)
  decrypter.setPrivateKey(publicKey)
  var res = decrypter.decrypt(cipher)
  return res
}

export function rsaEncrypt(plain: string) {
  var config = { default_key_size: "1024" }
  var encrypter = new JSEncrypt(config)
  encrypter.setPublicKey(publicKey)
  var res = encodeURIComponent(encrypter.encrypt(plain))
  return res
}

export function encrypt(data: string, dynStr: string) {
  var key = JSON.parse(rsaDecrypt(dynStr))["cKey"]
  key = CryptoJS.enc.Utf8.parse(key)
  let srcs = CryptoJS.enc.Utf8.parse(data)
  let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.toString()
}