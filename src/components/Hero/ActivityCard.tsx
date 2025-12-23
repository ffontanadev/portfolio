import { motion } from 'framer-motion';
import ActivityItem from './ActivityItem';

interface Activity {
  text: string;
  link?: string;
}

interface ActivityCardProps {
  title?: string;
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  { text: 'Experimenting in Unity 3D' },
  { text: 'Reading Atomic Habits' },
  { text: 'Messing with D series engines' },
];

const ActivityCard = ({
  title = "what you'll find me doing",
  activities = defaultActivities
}: ActivityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-cream-100 rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium text-gray-600 mb-4 lowercase">{title}</h3>
      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityItem key={index} text={activity.text} link={activity.link} />
        ))}
      </ul>
    </motion.div>
  );
};

export default ActivityCard;
