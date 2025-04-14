import Story from "@/components/story";
import { STORIES } from "@/constants/mock-data";
import { styles } from "@/styles/feed-styles";
import { ScrollView } from "react-native";
export default function StorySection(){
  return (
     <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      >
        {STORIES.map((story) => (
        <Story key={story.id} story={story}/>
      ))}
      </ScrollView> 
  )
}