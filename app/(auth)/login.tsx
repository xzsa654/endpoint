import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '@/styles/auth-styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useSSO } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
export default function Login() {
  const {startSSOFlow}  = useSSO()
  const router =useRouter()
  const handleGoogleSingIn = async () => {
    try {
     const {createdSessionId,setActive}= await startSSOFlow({strategy:"oauth_google"})
      if (setActive && createdSessionId) {
       setActive({session:createdSessionId})
       router.replace("/(tabs)")
     }
    } catch (error) {
      console.log("OAUTH error:",error);
    }
  }
  return (
    <View style={styles.container}>
      {/* 品牌部分 */}
      <View style={styles.brandSection}>
      <View style={styles.logoContainer}>
        <Ionicons name="radio-button-off-outline" size={32} color={COLORS.primary}/>
        </View>
        <Text style={styles.appName}>endpoint</Text>
        <Text style={styles.tagline}>句點，不容錯過</Text>
      </View>
      {/* 登入部分 */}
      <View style={styles.loginSection}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSingIn}
        activeOpacity={0.9}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface}></Ionicons>
          </View>
          <Text style={styles.googleButtonText}>使用GOOGLE帳號登入</Text>
        </TouchableOpacity>
          <Text style={styles.termsText}>繼續表示您同意我們的條款和隱私權政策</Text>
        </View>
    </View>
  )
}