import { useState } from 'react';
import { Box, Button, Input, VStack, Text, useToast, Heading, Container} from '@chakra-ui/react';
import api from '../services/api';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Succès",
        description: "Document indexé avec succès !",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFile(null);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Ajouter un Document</Heading>
        
        <Box 
          position="relative"
          border="2px dashed" 
          borderColor="gray.600" 
          borderRadius="xl" 
          p={10} 
          textAlign="center"
          bg="gray.800"
        >
          <Input 
            type="file" 
            onChange={handleFileChange} 
            height="100%" 
            opacity={0} 
            position="absolute" 
            top={0} 
            left={0} 
            cursor="pointer" 
          />
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="bold">
              {file ? `Fichier sélectionné : ${file.name}` : "Glissez un fichier ou cliquez ici"}
            </Text>
            <Text fontSize="sm" color="gray.400">PDF, DOCX, TXT supportés</Text>
          </VStack>
        </Box>

        <Button 
          colorScheme="green" 
          size="lg" 
          onClick={handleUpload} 
          isLoading={loading}
          isDisabled={!file}
        >
          Lancer l'Indexation IA
        </Button>
      </VStack>
    </Container>
  );
};

export default UploadPage;