import { Box, Flex, Button, Heading, HStack, Spacer } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg="gray.900" px={4} py={3} borderBottom="1px" borderColor="gray.700">
      <Flex alignItems="center">
        <Heading size="md" color="white" mr={8}>
          AI Doc Manager
        </Heading>
        
        <HStack spacing={4}>
          <Link to="/">
            <Button variant="ghost" colorScheme="blue">Recherche</Button>
          </Link>
          <Link to="/documents">
            <Button variant="ghost" colorScheme="orange">Documents</Button>
          </Link>
          <Link to="/upload">
            <Button variant="ghost" colorScheme="green">Uploader</Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" colorScheme="purple">Historique</Button>
          </Link>
        </HStack>

        <Spacer />

        <HStack>
          <Button size="sm" colorScheme="red" variant="outline" onClick={handleLogout}>
            Déconnexion ({user?.name})
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;