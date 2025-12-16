import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Button, Input, Heading, VStack, Text, useToast, Container, Link 
} from '@chakra-ui/react';
// Plus besoin d'importer 'api'
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
      toast({ status: "warning", title: "Champs requis", description: "Remplissez tout svp." });
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.auth.register({ name, email, password });

      toast({ status: "success", title: "Compte créé !", description: "Connexion..." });

      await login(email, password);
      navigate('/');

    } catch (err: any) {
      const message = err.message || "Erreur inconnue";
      toast({ status: "error", title: "Erreur", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container centerContent h="100vh" justifyContent="center">
      <Box p={8} maxWidth="400px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="gray.800" w="100%">
        <VStack spacing={4} align="stretch">
          <Heading as="h2" size="lg" textAlign="center">Inscription</Heading>
          <Box>
            <Text mb={2}>Nom</Text>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Box>
          <Box>
            <Text mb={2}>Email</Text>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Box>
          <Box>
            <Text mb={2}>Mot de passe</Text>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Box>
          <Button colorScheme="green" onClick={handleSubmit} isLoading={loading}>Créer mon compte</Button>
          <Text textAlign="center" fontSize="sm" mt={2}>
            Déjà un compte ? <Link as={RouterLink} to="/login" color="blue.300">Se connecter</Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default RegisterPage;