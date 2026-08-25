module.exports = {
  project: {
    android: {
      sourceDir: './android',
    },
    ios: {
      sourceDir: './ios',
    },
  },
  assets: [],
  // The app renders icons as emoji/unicode and does not use
  // react-native-vector-icons, so exclude its font files from the build
  // to keep the APK/IPA smaller. If you later adopt vector-icons, list the
  // specific fonts you need here, e.g. ['node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf'].
  reactNativeVectorIcons: {
    excludeFonts: [
      'AntDesign.ttf',
      'Entypo.ttf',
      'EvilIcons.ttf',
      'Feather.ttf',
      'FontAwesome.ttf',
      'FontAwesome5_Brands.ttf',
      'FontAwesome5_Regular.ttf',
      'FontAwesome5_Solid.ttf',
      'FontAwesome6_Brands.ttf',
      'FontAwesome6_Regular.ttf',
      'FontAwesome6_Solid.ttf',
      'Foundation.ttf',
      'Ionicons.ttf',
      'MaterialCommunityIcons.ttf',
      'MaterialIcons.ttf',
      'Octicons.ttf',
      'SimpleLineIcons.ttf',
      'Zocial.ttf',
      'Fontisto.ttf',
    ],
  },
};
