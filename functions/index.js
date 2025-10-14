const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const {getAuth} = require("firebase-admin/auth");
const admin = require("firebase-admin");
// 新增：导入 Gemini SDK
const {GoogleGenAI} = require("@google/genai");

admin.initializeApp();

let SENDGRID_API_KEY;
let GEMINI_API_KEY;

// 确保在顶层代码中先尝试读取一次配置
try {
  SENDGRID_API_KEY=process.env.SENDGRID_API_KEY;
  GEMINI_API_KEY=process.env.GEMINI_API_KEY;
} catch (e) {
  /* Ignored: Will be checked again inside the function */
}

// -----------------------------------------------------
// 现有函数: sendEmailV2 (已集成可选附件逻辑)
// -----------------------------------------------------
exports.sendEmailV2 =
functions.https.onRequest(async (req, res) => {
  // 1. 设置 CORS 头部 (允许所有来源以方便调试)
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
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
      SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
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
// -----------------------------------------------------
// 🚨 新增函数: generateContent (用于 Gemini AI 调用)
// -----------------------------------------------------
exports.generateContent = functions.https.onRequest(async (req, res) => {
  // 1. 设置 CORS (允许所有来源!)
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).send({error: "Method Not Allowed"});
  }

  // 2. 身份验证 (确保用户已登录)
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).send(
        {error: "Unauthenticated: Authorization header missing."});
  }

  const idToken = authorizationHeader.split("Bearer ")[1];
  try {
    await getAuth().verifyIdToken(idToken);
  } catch (e) {
    return res.status(401).send(
        {error: "Unauthenticated: Invalid or expired token."});
  }

  // 3. 密钥检查
  let apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    try {
      // 尝试再次从 config 读取 (以防顶层读取失败)
      apiKey = functions.config().gemini.key;
    } catch (e) {
      /* pass */
    }
  }

  if (!apiKey) {
    return res.status(500).send(
        {error: "Gemini API Key is not configured on the server."});
  }

  const {prompt} = req.body;
  if (!prompt) {
    return res.status(400).send({error: "Prompt is required."});
  }
  // 指导AI行为
  const SYSTEM_INSTRUCTION = `
    You are a compassionate and empathetic AI mental health
    assistant for a youth platform called HearYou. 
    Your role is to:
    - Provide empathetic, non-judgmental support and validate feelings.
    - Keep conversations supportive and concise (aim for 2-3 paragraphs).
    - NEVER provide medical diagnoses or treatment plans.
    - In case of crisis (e.g., suicide, self-harm),
    immediately suggest contacting emergency services (000, 13 11 14 Lifeline).
    - Be warm and age-appropriate for teenagers and young adults.
  `;
  const contents = [
    {role: "user", parts: [
      {text: `${SYSTEM_INSTRUCTION}\n\nUser's message: ${prompt}`}]},
  ];

  try {
    const ai = new GoogleGenAI({apiKey: apiKey});
    // 调用 Gemini-2.5-Flash 模型
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        temperature: 0.7,
      },
    });

    // 成功返回生成的文本
    return res.status(200).send({content: response.text});
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return res.status(500).send(
        {error: `AI generation failed. Details: ${error.message}`});
  }
});
