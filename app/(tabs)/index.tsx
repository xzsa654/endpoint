import { Loader } from "@/components/loading";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed-styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import StorySection from "@/components/stories";
import { useQuery } from "convex/react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { set } from "date-fns";
export default function Index() {
  const { signOut } = useAuth()
  const [refreshing,setRefreshing] =useState(false)

  const posts = useQuery(api.posts.getFeedPost)

  if (posts === undefined) return <Loader />
  
  if (posts.length == 0) return <NoPostsFound />
  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    },2000)
  }
  return (
    <View style={styles.container}>
    {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>endpoint</Text>
        <TouchableOpacity onPress={()=>signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white}/>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={COLORS.primary}
        />}
        renderItem={({ item })=><Post post={item} />}
        keyExtractor={(item)=>item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom:60}}
        ListHeaderComponent={<StorySection/>}
      />
     
    </View>
  );
}

const NoPostsFound = () => {
  return (
    <View style={{
      flex:1,
      backgroundColor:COLORS.background,
      justifyContent:"center",
      alignItems:"center",
    }}>
      <Ionicons name="alert-circle-outline" size={88} bottom={15} color={COLORS.primary} />
      <Text style={{fontSize:27,bottom:15,  color:COLORS.white}}>暫無貼文</Text>
    </View>
  );
}

