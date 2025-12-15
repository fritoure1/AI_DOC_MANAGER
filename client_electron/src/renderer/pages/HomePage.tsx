import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Plus d'import API
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

  const handleOpenDocument = async (docId: string) => {
    if(!user) return;
    setOpeningId(docId);

    try {
        // 1. On récupère le chemin (comme avant)
        const path = await window.electronAPI.documents.getFile(parseInt(docId), parseInt(user.id));
        
        // 2. 👇 REMPLACEMENT : On demande à Electron d'ouvrir ce chemin
        await window.electronAPI.files.open(path);
        
        // Optionnel : petit toast de succès (ou rien, car le fichier s'ouvre)
        // toast({ status: 'success', title: "Fichier ouvert", duration: 1000 });

    } catch (error: any) {
        console.error(error);
        toast({ 
          status: 'error', 
          title: "Erreur", 
          description: "Impossible d'ouvrir le fichier (est-il bien dans le dossier AI_api ?)" 
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
    if (!query.trim() || !user) return;

    setLoading(true);

    try {
      // 👇 REMPLACEMENT : Appel IPC search:query
      // Note : Le back retourne directement le tableau de résultats
      const data = await window.electronAPI.search.query(query, parseInt(user.id));
      
      if (Array.isArray(data)) {
        const groups = groupResultsByFile(data);
        setGroupedResults(groups);
      } else {
        setGroupedResults([]);
      }

    } catch (err) {
      console.error("Erreur recherche:", err);
      toast({ status: "error", title: "Erreur lors de la recherche" });
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

                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    variant="solid"
                    // On passe juste l'ID maintenant, plus besoin du fileName pour le blob
                    onClick={() => handleOpenDocument(group.document_id)}
                    isLoading={openingId === group.document_id}
                  >
                    ouvrir ↗
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