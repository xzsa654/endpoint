import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, TextInput } from 'react-native'
import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { styles } from '@/styles/create-styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import * as ImagePicker from "expo-image-picker"
import {Image} from "expo-image"
import * as FileSystem from "expo-file-system"
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
export default function CreateScreen() {
  const router = useRouter()
  const {user} = useUser()
  const [selectedImage,setSelectedImage] = useState<string|null>(null)
  const [isSharing,setIsSharing] = useState(false)
  const [caption, setCaption] = useState("")
  const scrollViewRef =useRef<ScrollView>(null)
  const generateImageUrl =useMutation(api.posts.generateUploadUrl)
  const createPost = useMutation(api.posts.createPost)
  // 選取圖片
  const pickImage = async() => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing:true,
      aspect: [1, 1],
      quality:.8
    })
    if(!result.canceled) setSelectedImage(result.assets[0].uri)
  }
  const handleCaptionChange = (text: string) => {
    setCaption(text);
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  };
  // 發布貼文
  const handleShare = async() => {
    if(!selectedImage) return
    try {
      setIsSharing(true)
      // 轉換圖片 URL
      const uploadUrl = await generateImageUrl()
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType:"image/jpeg"
        }
      )
      if(uploadResult.status!==200) throw new Error("上傳失敗")
      const {storageId} =JSON.parse(uploadResult.body) 
      await createPost({
        caption,
        storageId
      })
      
      setSelectedImage(null);
      setCaption("");

      router.push("/(tabs)")
    } catch (error) {
      console.log("上傳失敗",error);
    } finally {
      setIsSharing(false)
    }
  }
  // 初始畫面
  if(!selectedImage)return (
    <View style={styles.container}>
    <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      <Text style={styles.headerTitle}>新貼文</Text>
      <View style={{width:28}}/>
      </View>
      <TouchableOpacity style={styles.emptyImageContainer} onPress={pickImage}>
        <Ionicons name="image-outline" size={48} color={COLORS.grey}/>
        <Text style={styles.emptyImageText}>點擊選取圖片</Text>
      </TouchableOpacity>
    </View>
  )
  return (
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS==="ios"?100:0}
    >
    <View style={styles.contentContainer}>
      {/* header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => {
        setSelectedImage(null)
        setCaption("")
      }} disabled={isSharing}>
        <Ionicons name="close-outline" size={28} color={isSharing?COLORS.grey:COLORS.white}/>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>新貼文</Text>
      
      <TouchableOpacity style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
      >
            {isSharing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
        ):<Text style={styles.shareText} >分享</Text>}
      </TouchableOpacity>
        </View>
        <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        contentOffset={{y:100,x:0}}  
        >
          <View
          style={[styles.content,isSharing&&styles.contentDisabled]}
          >
            {/* Image Section */}
            <View style={styles.imageSection}>
              <Image source={selectedImage}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              disabled={isSharing}
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />
                <Text style={styles.changeImageText}>更換</Text>
              </TouchableOpacity>
            </View>
            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                source={user?.imageUrl}
                style={styles.userAvatar}
                contentFit='cover'
                transition={200}
                />
                <TextInput
                style={styles.captionInput}
                placeholder='描述關於這張圖片．．．'
                placeholderTextColor={COLORS.grey}
                multiline
                value={caption}
                onChangeText={handleCaptionChange}
                editable={!isSharing}
                />
              </View>
            </View>
          </View>
        </ScrollView>
    </View>
  </KeyboardAvoidingView>
  )
}