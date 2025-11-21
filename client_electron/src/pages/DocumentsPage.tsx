import { useEffect, useState } from 'react';
import { 
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Text, Badge, HStack, Button, useToast 
} from '@chakra-ui/react';
import api from '../services/api';

interface DocumentData {
  id: string;
  file_name: string;
  file_path: string;
  doc_type: string;
  created_at: string;
  DOCUMENT_TAGS: { TAGS: { name: string, id: string } }[];
  _count: { DOCUMENT_CHUNKS: number };
}

const DocumentsPage = () => {
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocs(res.data);
      } catch (err) {
        console.error("Erreur chargement documents:", err);
      }
    };
    fetchDocs();
  }, []);

  // 1. Petit utilitaire pour deviner le type MIME
  const getMimeType = (docType: string) => {
    switch (docType.toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'txt': return 'text/plain';
      case 'md': return 'text/markdown';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream'; // Type générique
    }
  };

  // 2. La fonction prend maintenant le docType en argument
  const handleOpenDocument = async (docId: string, docType: string) => {
    setOpeningId(docId);
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });

      // 3. On utilise le type dynamique ici !
      const mimeType = getMimeType(docType);
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));

      window.open(fileURL, '_blank');

    } catch (error) {
      console.error("Erreur ouverture document:", error);
      toast({
        title: "Impossible d'ouvrir le fichier",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setOpeningId(null);
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'pdf') return 'red';
    if (type === 'docx') return 'blue';
    if (type === 'txt') return 'gray';
    return 'purple';
  };

  return (
    <Box p={8} maxWidth="1200px" margin="0 auto">
      <Heading mb={8} color="white">Ma Bibliothèque 📚</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {Array.isArray(docs) && docs.length > 0 ? (
          docs.map((doc) => (
            <Card key={doc.id} bg="gray.800" borderColor="gray.700" borderWidth={1} _hover={{ borderColor: "gray.500" }}>
              
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <Badge colorScheme={getTypeColor(doc.doc_type)} fontSize="0.8em">
                    {doc.doc_type.toUpperCase()}
                  </Badge>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </HStack>
              </CardHeader>

              <CardBody py={2}>
                <Heading size="md" noOfLines={1} title={doc.file_name} color="blue.200">
                  {doc.file_name}
                </Heading>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  {doc._count ? `${doc._count.DOCUMENT_CHUNKS} fragments indexés` : 'Non indexé'}
                </Text>
              </CardBody>

              <CardFooter pt={4} display="flex" flexDirection="column" gap={3}>
                
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  variant="outline" 
                  width="full"
                  isLoading={openingId === doc.id}
                  // 4. On passe le doc.doc_type à la fonction
                  onClick={() => handleOpenDocument(doc.id, doc.doc_type)}
                >
                  Ouvrir le fichier 📄
                </Button>

                <Box width="full">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>TAGS :</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {doc.DOCUMENT_TAGS && doc.DOCUMENT_TAGS.length > 0 ? (
                      doc.DOCUMENT_TAGS.map((dt) => (
                        <Badge key={dt.TAGS.id} colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                          #{dt.TAGS.name}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="xs" fontStyle="italic" color="gray.600">Aucun tag</Text>
                    )}
                  </HStack>
                </Box>

              </CardFooter>
            </Card>
          ))
        ) : (
          <Text textAlign="center" mt={10} color="gray.500">
            Aucun document trouvé.
          </Text>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default DocumentsPage;