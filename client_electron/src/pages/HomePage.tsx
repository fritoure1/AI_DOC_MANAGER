import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Box, Input, Button, VStack, HStack, Text, Card, CardBody, 
  Badge, Spinner, Heading, useToast, CardHeader, Divider 
} from '@chakra-ui/react';

interface SearchResult {
  chunk_id: string;
  document_id: string; 
  score: number;
  content: string;
  file_name: string;
}

interface GroupedResult {
  file_name: string;
  document_id: string;
  max_score: number;
  chunks: SearchResult[];
}

const HomePage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  
  const [query, setQuery] = useState('');
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  // --- 1. FONCTION INTELLIGENTE POUR LE TYPE DE FICHIER ---
  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'txt': return 'text/plain';
      case 'md':  return 'text/markdown';
      // Pour Word, c'est un type spécial
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':  return 'application/msword';
      default: return 'application/octet-stream'; // Type générique
    }
  };

  // --- 2. FONCTION D'OUVERTURE ---
  const handleOpenDocument = async (docId: string, fileName: string) => {
    setOpeningId(docId);
    try {
      // On demande le fichier binaire (blob)
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });

      // On détermine le bon type grâce au nom du fichier
      const mimeType = getMimeType(fileName);
      
      // On crée le fichier en mémoire avec le bon type
      const file = new Blob([response.data], { type: mimeType });
      const fileURL = window.URL.createObjectURL(file);

      // Si c'est un DOCX, on force le téléchargement (car le navigateur ne peut pas l'afficher)
      if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', fileName); // Force le téléchargement
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({
            title: "Téléchargement lancé",
            description: "Le fichier Word a été téléchargé.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
      } else {
        // Pour PDF et TXT, on ouvre dans un nouvel onglet
        window.open(fileURL, '_blank');
      }

    } catch (error) {
      console.error("Erreur ouverture document:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le fichier source.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setOpeningId(null);
    }
  };

  const groupResultsByFile = (results: SearchResult[]): GroupedResult[] => {
    const groups: { [key: string]: GroupedResult } = {};

    results.forEach((res) => {
      if (!groups[res.file_name]) {
        groups[res.file_name] = {
          file_name: res.file_name,
          document_id: res.document_id,
          max_score: res.score,
          chunks: []
        };
      }
      groups[res.file_name].chunks.push(res);
      
      if (res.score > groups[res.file_name].max_score) {
        groups[res.file_name].max_score = res.score;
      }
    });

    return Object.values(groups).sort((a, b) => b.max_score - a.max_score);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    // setResults([]); // Optionnel pour éviter le clignotement

    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      
      if (Array.isArray(response.data)) {
        const groups = groupResultsByFile(response.data);
        setGroupedResults(groups);
      } else {
        setGroupedResults([]);
      }

    } catch (err) {
      console.error("Erreur recherche:", err);
      toast({ status: "error", title: "Erreur serveur lors de la recherche" });
      setGroupedResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} maxWidth="900px" margin="0 auto">
      
      <HStack justifyContent="space-between" mb={10}>
        <Heading size="md">Bonjour, {user?.name} 👋</Heading>
        <Button colorScheme="red" variant="outline" onClick={logout} size="sm">Déconnexion</Button>
      </HStack>

      <HStack mb={8}>
        <Input 
          placeholder="Posez votre question sémantique..." 
          size="lg" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          bg="gray.700" border="none" color="white"
        />
        <Button colorScheme="blue" size="lg" onClick={handleSearch} isLoading={loading}>
          Chercher
        </Button>
      </HStack>

      <VStack spacing={6} align="stretch">
        {loading && <Spinner alignSelf="center" size="xl" color="blue.500" />}
        
        {!loading && groupedResults.length > 0 ? (
          groupedResults.map((group) => (
            <Card key={group.file_name} variant="outline" bg="gray.800" borderColor="gray.600" overflow="hidden">
              
              <CardHeader bg="gray.700" py={3}>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="xl">📄</Text>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm" color="blue.200">{group.file_name}</Heading>
                      <Badge colorScheme="green" fontSize="0.7em">
                        {group.chunks.length} passage(s)
                      </Badge>
                    </VStack>
                  </HStack>

                  {/* BOUTON OUVRIR */}
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    variant="solid"
                    // On passe le nom du fichier pour deviner l'extension
                    onClick={() => handleOpenDocument(group.document_id, group.file_name)}
                    isLoading={openingId === group.document_id}
                  >
                    Ouvrir ↗
                  </Button>
                </HStack>
              </CardHeader>

              <CardBody>
                <VStack align="stretch" spacing={4} divider={<Divider borderColor="gray.600" />}>
                  {group.chunks.map((chunk) => (
                    <Box key={chunk.chunk_id}>
                      <Text color="gray.300" fontSize="sm" fontStyle="italic">
                        "... {chunk.content} ..."
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                        Pertinence : {chunk.score.toFixed(2)}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </CardBody>

            </Card>
          ))
        ) : (
          !loading && query && <Text color="gray.500" textAlign="center">Aucun résultat trouvé.</Text>
        )}
      </VStack>

    </Box>
  );
};

export default HomePage;