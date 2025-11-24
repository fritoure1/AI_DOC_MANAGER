import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Button, Input, Heading, VStack, Text, useToast, Container, Link 
} from '@chakra-ui/react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; 

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const { login } = useAuth(); 

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password
      });

      toast({
        title: "Compte créé !",
        description: "Connexion automatique...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      await login(email, password);

      navigate('/');

    } catch (err: any) {
      const message = err.response?.data?.error || "Une erreur est survenue.";
      toast({
        title: "Erreur",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
        borderColor="gray.700"
        w="100%"
      >
        <VStack spacing={4} align="stretch">
          <Heading as="h2" size="lg" textAlign="center" color="white">
            Inscription
          </Heading>
          
          <Box>
            <Text mb={2} color="gray.300">Nom complet</Text>
            <Input 
              placeholder="Abdel Elfassi" 
              value={name}
              onChange={(e) => setName(e.target.value)} 
              bg="gray.700" border="none" color="white"
            />
          </Box>

          <Box>
            <Text mb={2} color="gray.300">Email</Text>
            <Input 
              type="email" 
              placeholder="test@exemple.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              bg="gray.700" border="none" color="white"
            />
          </Box>

          <Box>
            <Text mb={2} color="gray.300">Mot de passe</Text>
            <Input 
              type="password" 
              placeholder="******" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              bg="gray.700" border="none" color="white"
            />
          </Box>

          <Button 
            colorScheme="green" 
            width="full" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            Créer mon compte
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.400" mt={2}>
            Déjà un compte ?{' '}
            <Link as={RouterLink} to="/login" color="blue.300">
              Se connecter
            </Link>
          </Text>

        </VStack>
      </Box>
    </Container>
  );
};

export default RegisterPage;