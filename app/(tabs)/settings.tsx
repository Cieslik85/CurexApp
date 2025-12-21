import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

const THEME_OPTIONS = [
  { id: 'light' as ThemeMode, name: 'Light', icon: 'sunny', description: 'Clean and bright interface' },
  { id: 'dark' as ThemeMode, name: 'Dark', icon: 'moon', description: 'Easy on the eyes in low light' },
  { id: 'auto' as ThemeMode, name: 'Auto', icon: 'phone-portrait', description: 'Follows system setting' },
];

export default function SettingsScreen() {
  const { theme, settings, updateSettings } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    updateSettings({ mode });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.sectionDescription}>Choose your preferred theme mode</Text>
          <View style={styles.optionsContainer}>
            {THEME_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  settings.mode === option.id && styles.optionCardSelected
                ]}
                onPress={() => handleThemeChange(option.id)}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color={settings.mode === option.id ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                  </View>
                  <Text style={[
                    styles.optionTitle,
                    settings.mode === option.id && { color: theme.colors.primary }
                  ]}>
                    {option.name}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 36,
  },
  bottomPadding: {
    height: 32,
  },
});