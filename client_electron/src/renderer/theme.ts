import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark', 
  useSystemColorMode: false,
};

const colors = {
  brand: {
    100: '#E9D8FD',
    200: '#D6BCFA',
    300: '#B794F4',
    400: '#9F7AEA',
    500: '#805AD5', 
    600: '#6B46C1',
    700: '#553C9A',
    800: '#44337A',
    900: '#322659',
  },
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: '12px',
    },
    variants: {
      'glow': {
        bg: 'brand.500',
        color: 'white',
        boxShadow: '0 0 15px #805AD5',
        _hover: {
          bg: 'brand.400',
          boxShadow: '0 0 25px #9F7AEA',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl', 
        borderWidth: '1px',
        borderColor: 'whiteAlpha.200', 
      }
    }
  }
};

const styles = {
  global: {
    body: {
      bg: 'gray.900',
      color: 'white',
    },
  },
};

const theme = extendTheme({ config, colors, components, styles });

export default theme;