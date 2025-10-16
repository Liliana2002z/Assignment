import { ref } from 'vue';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore'; 


export const user = ref({
  isLoggedIn: false,
  uid: null,
  name: 'Guest',
  role: 'user',
  points: 0,
  badges: []
});


// 从 Firestore 加载用户的角色和名字
const loadUserRoleAndProfile = async (firebaseUser) => {
    
    // 🚨 初始名称：使用 Auth DisplayName，如果不存在，则使用 Email
    const authUserName = firebaseUser ? (firebaseUser.displayName || firebaseUser.email) : 'Guest';

    if (!firebaseUser) {
        // 用户登出或未登录
        user.value = { 
            isLoggedIn: false, 
            uid: null, 
            name: 'Guest', 
            role: 'user',
            points: 0,
            badges: []
        };
        return;
    }
    
    // 1. 设置初始状态 (基于 Auth)
    user.value.isLoggedIn = true;
    user.value.uid = firebaseUser.uid;
    user.value.name = authUserName;
    user.value.role = 'user';
    user.value.points = 0;
    user.value.badges = [];

    try {
        // 2. 尝试从 Firestore 的 'users' 集合中读取用户文档
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            
            // 🚨 覆盖名称：如果 Firestore 中有 name 字段，则使用它
            user.value.name = data.name || user.value.name; 
            
            // 更新 Profile 信息
            user.value.points = data.points || 0;
            user.value.badges = data.badges || [];
            
            // 使用 Firestore 中的角色 (最高优先级，用于 admin, volunteer)
            if (data.role && ['admin', 'volunteer', 'user'].includes(data.role)) {
                user.value.role = data.role;
                return; // 如果 Firestore 中有有效的角色，直接返回，跳过邮件后缀检查
            }
        }
    } catch (error) {
        // 如果 Firestore 读取失败 (如权限问题)，记录错误，但继续使用 Auth 提供的默认值
        console.error("Error loading user profile from Firestore:", error);
    }
    
    // 3. 备选方案：如果 Firestore 中没有角色或读取失败，检查邮件后缀
    const userEmail = firebaseUser.email || '';
    if (userEmail.endsWith('@volunteer.com')) {
        user.value.role = 'volunteer';
    }
    // 否则，保持默认的 'user' 角色。
};


// 将 onAuthStateChanged 链接到新的异步加载函数
onAuthStateChanged(auth, loadUserRoleAndProfile);


const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

export { db, auth, signOut };