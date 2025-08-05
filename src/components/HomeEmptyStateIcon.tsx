import { UserIcon } from "lucide-react-native";
import { View } from "react-native";


const EmptyStateIcon = ({ size = 80, color = "#9CA3AF" }) => (
    <View className="w-[80px] h-[80px] flex items-center justify-center">
        <UserIcon size={size * 0.6} color={color} strokeWidth={1.25} />
    </View>
);

export default EmptyStateIcon;