import { useEffect, useState } from 'react';
import { 
  Box, VStack, Text, Card, CardBody, Heading, Badge, Accordion, 
  AccordionItem, AccordionButton, AccordionPanel, AccordionIcon 
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

interface HistoryItem {
  id: string;
  query_text: string;
  created_at: string;
  SEARCH_RESULTS: any[]; 
}

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await window.electronAPI.history.get(parseInt(user.id));
        setHistory(data);
      } catch (err) {
        console.error("Erreur chargement historique:", err);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <Box p={8} maxWidth="900px" margin="0 auto">
      <Heading mb={8} color="white">Historique de Recherche</Heading>

      {Array.isArray(history) && history.length > 0 ? (
        <Accordion allowMultiple>
          {history.map((item) => (
            <AccordionItem key={item.id} border="1px solid" borderColor="gray.700" mb={2} borderRadius="md">
              <h2>
                <AccordionButton _expanded={{ bg: 'blue.900', color: 'white' }}>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontWeight="bold">🔍 "{item.query_text}"</Text>
                    <Text fontSize="xs" color="gray.400">
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="gray.800">
                <Text mb={2} fontSize="sm" color="gray.300">
                  {item.SEARCH_RESULTS.length} résultats trouvés :
                </Text>
                <VStack align="stretch" spacing={2}>
                  {item.SEARCH_RESULTS.map((res: any) => (
                    <Card key={res.id} size="sm" variant="outline" bg="gray.700" borderColor="gray.600">
                      <CardBody py={2}>
                        <Text fontWeight="bold" fontSize="sm" color="blue.200">
                          📄 {res.DOCUMENT_CHUNKS?.DOCUMENTS?.file_name || "Document inconnu"}
                        </Text>
                        <Badge colorScheme="purple" mt={1}>
                          Score: {res.score ? res.score.toFixed(2) : "N/A"}
                        </Badge>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Text textAlign="center" mt={10} color="gray.500">
          Aucun historique de recherche disponible.
        </Text>
      )}
    </Box>
  );
};

export default HistoryPage;