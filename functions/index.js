const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const {getAuth} = require("firebase-admin/auth");
const admin = require("firebase-admin");
admin.initializeApp();

let SENDGRID_API_KEY;

// 确保在顶层代码中先尝试读取一次
try {
  SENDGRID_API_KEY = functions.config().sendgrid.key;
} catch (e) {
  /* Ignored: Will be checked again inside the function */
}

exports.sendEmailV2 =
functions.https.onRequest(async (req, res) => {
  // 1. 设置 CORS 头部
  res.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // 2. 验证 POST 方法
  if (req.method !== "POST") {
    return res.status(405).send({error: "Method Not Allowed"});
  }


  if (!SENDGRID_API_KEY) {
    try {
      // 如果第一次读取失败 (顶层)，这里再次尝试读取。
      SENDGRID_API_KEY = functions.config().sendgrid.key;
    } catch (e) {
      /* Ignored: 错误将在下面的 if 语句中被捕获 */
    }
  }

  const data = req.body;

  // 如果请求体为空，返回 400 (对应前端的 400 Bad Request)
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).send(
        {error: "Request body is missing data. Check Content-Type."});
  }

  // 3. 安全检查：验证用户令牌 (BR C.1/C.4)
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).send(
        {error: "Unauthenticated: Authorization header missing."});
  }

  const idToken = authorizationHeader.split("Bearer ")[1];
  try {
    // Firebase ID Token
    await getAuth().verifyIdToken(idToken);
  } catch (e) {
    return res.status(401).send(
        {error: "Unauthenticated: Invalid or expired token."});
  }

  // 4. SendGrid 初始化
  if (!SENDGRID_API_KEY) {
    return res.status(500).send(
        {error: "SendGrid API Key is not configured on the server."});
  }
  sgMail.setApiKey(SENDGRID_API_KEY);

  const senderEmail = "xxqian02@gmail.com";
  const {to, subject, text, attachmentBase64, filename, filetype} = data;

  const msg = {
    to: to,
    from: senderEmail,
    subject: subject,
    text: text,
    attachments: [],
  };

  if (attachmentBase64) {
    msg.attachments.push({
      content: attachmentBase64,
      filename: filename || "attachment.file",
      type: filetype || "application/octet-stream",
      disposition: "attachment",
    });
  }


  try {
    await sgMail.send(msg);
    return res.status(200).send(
        {success: true, message: "Send successfully."});
  } catch (error) {
    console.error("SendGrid API Error Details:",
        error.response ? error.response.body : error);

    return res.status(500).send(
        {error: "Send failed, check Cloud Function log."});
  }
});
// Force deploy to load new config
