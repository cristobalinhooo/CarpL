import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { theme } from '@/theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

function TabIcon({
  name,
  color,
  size,
}: {
  name: IconName;
  color: ColorValue;
  size: number;
}) {
  return <MaterialIcons name={name} color={color as string} size={size} />;
}

/** Tabs persistentes (Technical Spec §12.2/12.3): Inicio, Vehículos,
 *  Historial, Perfil. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.actionPrimary,
        tabBarInactiveTintColor: theme.colors.textPrimary,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        tabBarLabelStyle: theme.typography.label,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: (props) => <TabIcon name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehículos',
          tabBarIcon: (props) => <TabIcon name="directions-car" {...props} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: (props) => <TabIcon name="history" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: (props) => <TabIcon name="person" {...props} />,
        }}
      />
    </Tabs>
  );
}
