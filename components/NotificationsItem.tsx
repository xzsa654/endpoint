import { COLORS } from '@/constants/theme'
import { Id } from '@/convex/_generated/dataModel'
import { styles } from '@/styles/notification-styles'
import { Ionicons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface NotificationItemProps {
  receiverId: Id<"users">,
  senderId: Id<"users">,
  type: "like" | "comment" | "follow",
  postImage?:string,
  postId?: Id<"posts">,
  commentId?: Id<"comments">
  sender: {
    _id:Id<"users">,
    username: string,
    image:string
  }
  comment?:string 
  _creationTime: number
}

function Notification({ notification }:{notification:NotificationItemProps}) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={{
          pathname: '/user/[id]',
          params: { id: notification.sender._id }
          }} asChild>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={notification.sender.image}
            style={styles.avatar}
            contentFit='cover'
            transition={200}
          />
          <View style={styles.iconBadge}>
            {notification.type === "like" ? (
              <Ionicons name="heart" size={14} color={COLORS.primary} />
            ) : notification.type === "follow" ? (
              <Ionicons name="person-add" size={14} color="#8B5CF6" />
            ) : (
              <Ionicons name="chatbubble" size={14} color="#3B82F6" />
            )}
          </View>
        </TouchableOpacity>
        </Link>
        <View style={styles.notificationInfo}>
          <Link href={{
          pathname: '/user/[id]',
          params: { id: notification.sender._id }
          }} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>{notification.sender.username} </Text>
          </TouchableOpacity>
          </Link>
          <Text style={styles.action}>
            {notification.type === "follow"
              ? "關注了你"
              : notification.type === "like" ?
                "案讚了你的貼文" :
                `留言 "${notification.comment }"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime,{addSuffix:true})}
          </Text>
        </View>
      </View>
      {notification.postId && (
        <Image
          source={notification.postImage}
          style={styles.postImage}
          contentFit='cover'
          transition={200}/>
      )}
    </View>
  )
}

export default Notification