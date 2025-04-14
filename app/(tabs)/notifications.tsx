import { Loader } from '@/components/loading'
import Notification from '@/components/NotificationsItem'
import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/notification-styles'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import React from 'react'
import { FlatList, Text, View } from 'react-native'

export default function Notifications() {
  const notifications = useQuery(api.notification.getNotification)
  if(!notifications) return <Loader/>
  if(notifications.length===0) return <NotificationsNotFound/>
  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的消息</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => <Notification notification={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}



function NotificationsNotFound() { 
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      <Text style={{fontSize:20,color:COLORS.white}}>暫無消息</Text>
    </View >
  )
}