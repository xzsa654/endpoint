import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, Keyboard, KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { Loader } from '@/components/loading'
import { styles } from '@/styles/profiles-styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { Image } from 'expo-image'

export default function Profile() {
  const {userId,signOut}  = useAuth()
  const currentUser = useQuery(api.user.getUserByClerkId, userId ? { clerkId:userId}:"skip")
  const posts = useQuery(api.user.getPostByUserId,{})
  const updateProfile =useMutation(api.user.updateProfile)
  const [isEditModalVisible,setIsEditModalVisible] = useState(false)
  const [profileData, setProfileData] = useState({
    bio:currentUser?.bio||"",
    fullname:currentUser?.fullname||""
  })
  const [selectedPost,setSelectedPost] =useState<Doc<"posts">|null>(null)
  const handleSaveProfileData = async () => {
    await updateProfile(profileData)
    setIsEditModalVisible(false)
  }

  if(!currentUser||posts===undefined) return <Loader/>
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{ currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name='log-out-outline' size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* 大頭貼和統計數據 */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={currentUser.image}
                style={styles.avatar}
                contentFit='cover'
                transition={200}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>貼文</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>粉絲</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>追蹤者</Text>
              </View>
            </View>
          </View>
              <Text style={styles.name}>{currentUser.fullname}</Text>
              {currentUser.bio && <Text style={styles.bio}>{ currentUser.bio}</Text>}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editButtonText}>編輯個人資料</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name='share-outline' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        {posts.length === 0 && <NoPostFound />}
        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item })=>(
            <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
              <Image
                source={item.imageUrl}
                style={styles.gridImage}
                contentFit='cover'
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>
      {/* 編輯個人資料彈窗 */}
      <Modal
        visible={isEditModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={()=>setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS==="ios"?"padding":"height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>編輯個人資料</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name='close' size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>暱稱</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.fullname}
                  onChangeText={(text)=>setProfileData((prev)=>({...prev,fullname:text}))}
                  placeholderTextColor={COLORS.grey}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>簡介</Text>
                <TextInput
                  style={[styles.input,styles.bioInput]}
                  value={profileData.bio}
                  onChangeText={(text)=>setProfileData((prev)=>({...prev,bio:text}))}
                  placeholderTextColor={COLORS.grey}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfileData}>
                <Text style={styles.saveButtonText}>儲存變更</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      {/* 選中的圖片Modal */}
      <Modal
        visible={!!selectedPost}
        animationType='fade'
        transparent={true}
        onRequestClose={()=>setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name='close' size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Image
                source={selectedPost.imageUrl}
                style={styles.postDetailImage}
                contentFit='cover'
                transition={200}
                cachePolicy={"memory-disk"}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

function NoPostFound() {
  return (
    <View
      style={{
        height:"100%",
        backgroundColor:COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Ionicons name='images-outline' size={48} color={COLORS.primary}/>
      <Text style={{fontSize:20,color:COLORS.white}}>暫無貼文</Text>
      </View>
  )

}