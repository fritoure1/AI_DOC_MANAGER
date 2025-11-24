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
  const [deletingId, setDeletingId] = useState<string | null>(null); // État pour le chargement de suppression
  const toast = useToast();

  // 1. Chargement
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocs(res.data);
      } catch (err) {
        console.error("Erreur chargement documents:", err);
        toast({ status: 'error', title: "Erreur chargement documents" });
      }
    };
    fetchDocs();
  }, [toast]);

  // 2. Logique d'ouverture (MIME Types)
  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'txt': return 'text/plain;charset=utf-8';
      case 'md':  return 'text/markdown;charset=utf-8';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':  return 'application/msword';
      default: return 'application/octet-stream';
    }
  };

  const handleOpenDocument = async (docId: string, fileName: string) => {
    setOpeningId(docId);
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });

      const mimeType = getMimeType(fileName);
      const file = new Blob([response.data], { type: mimeType });
      const fileURL = window.URL.createObjectURL(file);

      if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({
          title: "Téléchargement lancé",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        window.open(fileURL, '_blank');
      }

    } catch (error) {
      console.error("Erreur ouverture:", error);
      toast({ title: "Impossible d'ouvrir le fichier", status: "error" });
    } finally {
      setOpeningId(null);
    }
  };

  // 3. Logique de Suppression (Réintégrée !)
  const handleDelete = async (docId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    setDeletingId(docId);
    try {
      await api.delete(`/documents/${docId}`);
      
      // On retire le document de la liste visuelle immédiatement
      setDocs(prevDocs => prevDocs.filter(d => d.id !== docId));
      
      toast({
        title: "Document supprimé",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error(error);
      toast({ title: "Erreur lors de la suppression", status: "error" });
    } finally {
      setDeletingId(null);
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
            <Card key={doc.id} bg="gray.800" borderColor="gray.700" borderWidth={1}>
              
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
                  {doc._count ? `${doc._count.DOCUMENT_CHUNKS} fragments` : 'Non indexé'}
                </Text>
              </CardBody>

              <CardFooter pt={4} display="flex" flexDirection="column" gap={3}>
                
                {/* Groupe de boutons : Ouvrir + Supprimer */}
                <HStack width="full" spacing={2}>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="outline" 
                      width="full"
                      isLoading={openingId === doc.id}
                      onClick={() => handleOpenDocument(doc.id, doc.file_name)}
                    >
                      Ouvrir
                    </Button>

                    <Button 
                      size="sm" 
                      colorScheme="red" 
                      variant="ghost"
                      isLoading={deletingId === doc.id}
                      onClick={() => handleDelete(doc.id)}
                      title="Supprimer le document"
                    >
                      🗑️
                    </Button>
                </HStack>

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