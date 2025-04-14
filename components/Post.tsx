import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/styles/feed-styles'
import { Link } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { Id } from '@/convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import CommentsModal from './CommentsModal'
import { formatDistanceToNow } from "date-fns";
import { useUser } from '@clerk/clerk-expo'


type postProps = {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookMarked: boolean;
    author: {
      _id: string
      username: string
      image: string
    };
}

export default function Post({post}:{post:postProps}) {
  const toggleLiked = useMutation(api.posts.toggleLiked)
  const toggleBookMark = useMutation(api.bookmark.toggleBookMark)
  const deletePost = useMutation(api.posts.deletePost)
  const [isLiked,setIsLiked] =useState(post.isLiked)
  const [isBookMarked,setIsBookMarked] =useState(post.isBookMarked)
  const [showComments,setShowComments] = useState(false)
  const handleLike = async () => {
    try {
    const result = await toggleLiked({postId:post._id})
      setIsLiked(result)
    } catch (error) {
      console.log("喜歡Error",error);
    }
  }
  const handleBookMark = async () => {
    const newIsBookMarked = await toggleBookMark({postId:post._id})
    setIsBookMarked(newIsBookMarked)
  }
  const {user} = useUser()
  const currentUser =  useQuery(api.user.getUserByClerkId,user?{clerkId:user?.id}:"skip")
  const handleDelete = async () => {
    try {
      await deletePost({postId:post._id})
    } catch (error) {
      console.log("刪除貼文失敗",error);
      
    }
  }
  return (
    
    <View style={styles.post}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Link href={currentUser?._id === post.author._id ?
          "/(tabs)/profile" :
          { pathname: "/user/[id]", params: { id: post.author._id } }} asChild>
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
            source={post.author.image}
            style={styles.postAvatar}
            contentFit='cover'
            transition={200}
            cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{ post.author.username}</Text>
          </TouchableOpacity>
        </Link>
        {post.author._id === currentUser?._id ? (
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name='trash-outline' size={20} color={COLORS.white}/>
        </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white}/>
          </TouchableOpacity>
        )}
      </View>
      {/* 圖片 */}
      <Image
      source={post.imageUrl}
      style={styles.postImage}
      contentFit='cover'
      transition={200}
      cachePolicy="memory-disk"
      />
      {/* 貼文功能 */}
      <View style={styles.postActions}>
    <View style={styles.postActionsLeft}>
     <TouchableOpacity onPress={handleLike} >
        <Ionicons name={isLiked?"heart":"heart-outline"} size={29} color={isLiked?COLORS.primary :COLORS.white }/>
     </TouchableOpacity>

     <TouchableOpacity onPress={()=>setShowComments(true)} ><Ionicons name="chatbubble-outline" size={25} color={COLORS.white} /></TouchableOpacity>

    </View>
    <TouchableOpacity onPress={handleBookMark} >
        <Ionicons name={isBookMarked?"bookmark" :"bookmark-outline"} size={25} color={isBookMarked? COLORS.primary:COLORS.white} />
    </TouchableOpacity>
   </View>
   {/* 貼文資訊  */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes>0 ? `${post.likes.toLocaleString()} likes`:"成為第一位按讚者"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username }</Text>
            <Text style={styles.captionText}>{post.caption }</Text>
          </View>
        )}
        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.commentText}>查看共{post.comments}則留言</Text>
          </TouchableOpacity>
        )
        }
        <Text style={styles.timeAgo}>{formatDistanceToNow(post._creationTime,{addSuffix:true}) }</Text>
        {
          <CommentsModal
            postId={post._id}
            visible={showComments}
            onClose={() => setShowComments(false)}
          />
        }
   </View>
    </View>
  )
}