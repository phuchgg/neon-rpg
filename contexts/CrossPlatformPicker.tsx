import React from 'react';
import { Platform, ViewStyle, StyleProp } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Option = {
  label: string;
  value: string;
};

type CrossPlatformPickerProps = {
  selectedValue: string;
  options: Option[];
  onValueChange: (value: string) => void;
  theme: {
    text: string;
    background: string;
    accent: string;
  };
  style?: StyleProp<ViewStyle>;
};

const CrossPlatformPicker: React.FC<CrossPlatformPickerProps> = ({
  selectedValue,
  options,
  onValueChange,
  theme,
  style,
}) => {
  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      style={[
        { backgroundColor: Platform.OS === 'android' ? '#1a1a2e' : 'transparent',
        color: Platform.OS === 'android' ? '#FFFFFF' : theme.text,
         }, 
        style,
      ]}
      dropdownIconColor={Platform.OS === 'android' ? theme.accent : undefined}
    >
      {options.map((opt) => (
        <Picker.Item
          key={opt.value}
          label={opt.label}
          value={opt.value}
          color={Platform.OS === 'android' ? '#000000' : theme.text}
        />
      ))}
    </Picker>
  );
};

export default CrossPlatformPicker;
