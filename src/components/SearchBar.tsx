import React, {useState, useCallback, useEffect} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useDebounce} from '../utils/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search Faculty, Subject or Room',
}) => {
  const {colors} = useTheme();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear();
  }, [onClear]);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <Text style={[styles.searchIcon, {color: colors.textSecondary}]}>
        {'\u2315'}
      </Text>
      <TextInput
        style={[styles.input, {color: colors.text}]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {query.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
          accessibilityRole="button">
          <Text style={[styles.clearText, {color: colors.primary}]}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 8,
    height: 32,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 32,
    fontSize: 12,
    paddingVertical: 0,
  },
  clearButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default React.memo(SearchBar);
