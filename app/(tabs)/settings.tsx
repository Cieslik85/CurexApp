import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode, ColorScheme, BackgroundStyle } from '@/contexts/ThemeContext';

const COLOR_SCHEMES = {
  blue: { primary: '#007AFF', secondary: '#34C759', accent: '#FF9500' },
  green: { primary: '#34C759', secondary: '#007AFF', accent: '#FF3B30' },
  purple: { primary: '#AF52DE', secondary: '#5856D6', accent: '#FF9500' },
  orange: { primary: '#FF9500', secondary: '#FF3B30', accent: '#34C759' },
  red: { primary: '#FF3B30', secondary: '#FF9500', accent: '#007AFF' },
  indigo: { primary: '#5856D6', secondary: '#AF52DE', accent: '#34C759' },
};

const THEME_OPTIONS = [
  { id: 'light' as ThemeMode, name: 'Light', icon: 'sunny', description: 'Clean and bright interface' },
  { id: 'dark' as ThemeMode, name: 'Dark', icon: 'moon', description: 'Easy on the eyes in low light' },
  { id: 'auto' as ThemeMode, name: 'Auto', icon: 'phone-portrait', description: 'Follows system setting' },
];

const BACKGROUND_OPTIONS = [
  { id: 'solid', name: 'Solid Color', icon: 'color-fill', description: 'Simple solid background' },
  { id: 'gradient', name: 'Gradient', icon: 'color-palette', description: 'Subtle gradient background' },
  { id: 'pattern', name: 'Pattern', icon: 'grid', description: 'Subtle geometric pattern' },
] as const;

export default function SettingsScreen() {
  const { theme, settings, updateSettings, resetToDefaults: resetTheme } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    updateSettings({ mode });
  };

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    updateSettings({ colorScheme });
  };

  const handleBackgroundChange = (backgroundStyle: BackgroundStyle) => {
    updateSettings({ backgroundStyle });
  };

  const handleToggleSetting = (key: 'reducedMotion' | 'highContrast') => {
    updateSettings({ [key]: !settings[key] });
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Theme Settings',
      'This will reset all theme and appearance settings to default. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetTheme,
        },
      ]
    );
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

        {/* Color Scheme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Scheme</Text>
          <Text style={styles.sectionDescription}>Select your preferred color palette</Text>
          <View style={styles.colorGrid}>
            {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map(scheme => (
              <TouchableOpacity
                key={scheme}
                style={[
                  styles.colorOption,
                  settings.colorScheme === scheme && { ...styles.colorOptionSelected, borderColor: theme.colors.primary }
                ]}
                onPress={() => handleColorSchemeChange(scheme)}
              >
                <View style={styles.colorPreview}>
                  <View style={[styles.colorSwatch, { backgroundColor: COLOR_SCHEMES[scheme].primary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: COLOR_SCHEMES[scheme].secondary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: COLOR_SCHEMES[scheme].accent }]} />
                </View>
                <Text style={[
                  styles.colorName,
                  settings.colorScheme === scheme && styles.colorNameSelected
                ]}>
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </Text>
                {settings.colorScheme === scheme && (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Background Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Style</Text>
          <Text style={styles.sectionDescription}>Customize the background appearance</Text>
          <View style={styles.backgroundOptions}>
            {BACKGROUND_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.backgroundOption,
                  settings.backgroundStyle === option.id && { ...styles.backgroundOptionSelected, borderColor: theme.colors.primary }
                ]}
                onPress={() => handleBackgroundChange(option.id)}
              >
                <View style={styles.backgroundIconContainer}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={settings.backgroundStyle === option.id ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                </View>
                <View style={styles.backgroundContent}>
                  <Text style={[
                    styles.backgroundTitle,
                    settings.backgroundStyle === option.id && { color: theme.colors.primary }
                  ]}>
                    {option.name}
                  </Text>
                  <Text style={styles.backgroundDescription}>{option.description}</Text>
                </View>
                {settings.backgroundStyle === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accessibility Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <Text style={styles.sectionDescription}>Adjust settings for better accessibility</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Reduced Motion</Text>
              <Text style={styles.settingDescription}>Reduce animations and transitions</Text>
            </View>
            <Switch
              value={settings.reducedMotion}
              onValueChange={() => handleToggleSetting('reducedMotion')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={settings.reducedMotion ? theme.colors.primary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>High Contrast</Text>
              <Text style={styles.settingDescription}>Increase contrast for better visibility</Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={() => handleToggleSetting('highContrast')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={settings.highContrast ? theme.colors.primary : theme.colors.surface}
            />
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <Text style={styles.sectionDescription}>See how your settings will look</Text>
          <View style={[
            styles.previewCard,
            { backgroundColor: COLOR_SCHEMES[settings.colorScheme].primary }
          ]}>
            <Text style={styles.previewTitle}>Sample Currency Card</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewCurrency}>🇺🇸 USD $ 1,234.56</Text>
              <View style={styles.previewButton}>
                <Text style={styles.previewButtonText}>Convert</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
            <Ionicons name="refresh" size={20} color={theme.colors.error} />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
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
  optionTitleSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 36,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  colorName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  colorNameSelected: {
    color: '#007AFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  backgroundOptions: {
    gap: 12,
  },
  backgroundOption: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backgroundOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  backgroundIconContainer: {
    marginRight: 12,
  },
  backgroundContent: {
    flex: 1,
  },
  backgroundTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  backgroundTitleSelected: {
    color: '#007AFF',
  },
  backgroundDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  settingRow: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCurrency: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  previewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.error + '20',
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.error,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
});