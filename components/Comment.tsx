import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '@/styles/feed-styles'
import {formatDistanceToNow} from "date-fns"
import { Link } from 'expo-router'
import { Id } from '@/convex/_generated/dataModel'
interface Comment {
  content: string
  _creationTime: number
  user: {
    _id:Id<"users">
    name:string
    image:string
  }
}
export default function Comment({ comment,closeComment }: { comment: Comment,closeComment:()=>void }) {
  return (
    <View style={styles.commentContainer}>
      <Link href={{pathname:"/user/[id]",params:{id:comment.user._id}}} asChild>
      <TouchableOpacity onPress={closeComment}>
      <Image source={{uri:comment.user.image}} style={styles.commentAvatar} />
      </TouchableOpacity>
      </Link>
      <View style={styles.commentContent}>
      <Link href={{pathname:"/user/[id]",params:{id:comment.user._id}}} asChild>
        <TouchableOpacity onPress={closeComment}>
          <Text style={styles.commentUsername}>{comment.user.name}</Text>
        </TouchableOpacity>
      </Link>
        <Text style={styles.commentText}>{ comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime,{addSuffix:true})}
        </Text>
      </View>
      {/* <Text>Comment</Text> */}
    </View>
  )
}