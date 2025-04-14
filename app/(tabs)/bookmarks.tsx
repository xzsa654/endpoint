import { View, Text, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import React from 'react'
import {  useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Loader } from '@/components/loading'
import { COLORS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '@/styles/feed-styles'

export default function Bookmarks() {
  const bookmarkPosts = useQuery(api.bookmark.getBookMark)
  if (bookmarkPosts === undefined) return <Loader />
  if (bookmarkPosts.length == 0) return <NoBookMarksFound />
  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的書籤</Text>
      </View>
      {/* 貼文 */}
      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap"
        }}
      >
        {bookmarkPosts.map((post) => {
          if (!post) return null
          return (
            <View key={post._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={post.imageUrl}
                style={{width:"100%",aspectRatio:1}}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
         ) 

        })}
      </ScrollView>
    </View>
  )
}

const NoBookMarksFound = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: "center",
      backgroundColor:COLORS.background
    }}>
      <Text><Ionicons name="heart-dislike-outline" size={48} color={COLORS.primary}/></Text>
      <Text style={{color:COLORS.primary,fontSize:22,paddingTop:10}}>暫無標籤任何貼文</Text>
    </View>
  )
}