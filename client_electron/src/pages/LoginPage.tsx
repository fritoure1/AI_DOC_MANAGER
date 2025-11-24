import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@chakra-ui/react';
import { 
  Box, Button, Input, Heading, VStack, Text, useToast, Container 
} from '@chakra-ui/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await login(email, password);
      navigate('/');
      toast({
        title: "Connexion réussie",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Email ou mot de passe incorrect.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container centerContent h="100vh" justifyContent="center">
      <Box 
        p={8} 
        maxWidth="400px" 
        borderWidth={1} 
        borderRadius={8} 
        boxShadow="lg"
        bg="gray.800"
        w="100%"
      >
        <VStack spacing={4} align="stretch">
          <Heading as="h2" size="lg" textAlign="center">
            Bienvenue
          </Heading>
          
          <Box>
            <Text mb={2}>Email</Text>
            <Input 
              type="email" 
              placeholder="test@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </Box>

          <Box>
            <Text mb={2}>Mot de passe</Text>
            <Input 
              type="password" 
              placeholder="******" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </Box>

          <Button colorScheme="blue" width="full" onClick={handleSubmit}>
            Se connecter
          </Button>
          <Text textAlign="center" fontSize="sm" color="gray.400" mt={2}>
            Pas encore de compte ?{' '}
            <Link as={RouterLink} to="/register" color="green.300">
              S'inscrire
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;