import { View, Text, Touchable, TouchableOpacity, ScrollView, Pressable, FlatList, Modal } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Loader } from '@/components/loading'
import { styles } from '@/styles/profiles-styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
export default function UserProfileScreen() {
  const router =useRouter()
  const { id } = useLocalSearchParams()
  const profile = useQuery(api.user.getUserProfile,{userId:id as Id<"users">})
  const posts = useQuery(api.user.getPostByUserId,{userId:id as Id<"users">})
  const isFollowing =useQuery(api.user.isFollowing,{followingId:id as Id<"users">})
  const toggleFollow =useMutation(api.user.toggleFollow)
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null); 

  const handleBack = () => {
    if(router.canGoBack()) router.back()
      else router.replace("/(tabs)")
  }
  if(profile===undefined||posts===undefined||isFollowing===undefined) return <Loader/>
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} >{profile.username}</Text>
        <View style={{width:24}}/>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <Image
              source={profile.image}
              style={styles.avatar}
              contentFit='cover'
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>貼文</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followers}</Text>
                <Text style={styles.statLabel}>粉絲</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.following}</Text>
                <Text style={styles.statLabel}>追蹤者</Text>
              </View>
            </View>
          </View>


          <Text style={styles.name}>{profile.fullname}</Text>
          {profile.bio&&<Text style={styles.bio}>{profile.bio}</Text>}
          <Pressable
            style={[styles.followButton,isFollowing&&styles.followingButton]}
            onPress={()=>toggleFollow({followingId:id as Id<"users">})}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? "已追蹤" : "追蹤"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.postsGrid}>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons name='image-outline' size={48} color={COLORS.grey} />
              <Text style={styles.noPostsText}>這個用戶還沒有貼文</Text>
            </View>
          ) : (
              <FlatList
                data={posts}
                scrollEnabled={false}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.gridItem} onPress={()=>setSelectedPost(item)}>
                    <Image
                      source={item.imageUrl}
                      style={styles.gridImage}
                      contentFit='cover'
                      transition={200}
                      cachePolicy={"memory-disk"}
                    />
                  </TouchableOpacity>
                )}
                numColumns={3}
              />
          )}
          </View>
      </ScrollView>
      <Modal visible ={!!selectedPost} 
      animationType="fade"
      transparent={true}
      onRequestClose={() => setSelectedPost(null)}
     >
       <View style={styles.modalBackdrop}>
         {selectedPost && (
           <View style={styles.postDetailContainer}>
             <View style={styles.postDetailHeader}>
               <TouchableOpacity onPress={() => setSelectedPost(null)}>
                 <Ionicons name="close" size={30} color={COLORS.white} />
               </TouchableOpacity>
             </View>
           <Image source={selectedPost.imageUrl} 
           cachePolicy={"memory-disk"}
           style={styles.postDetailImage}/>
           </View>
         )}
       </View>
     </Modal>
    </View>
  )
}