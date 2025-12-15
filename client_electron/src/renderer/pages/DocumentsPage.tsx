import { useEffect, useState } from 'react';
import { 
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Text, Badge, HStack, Button, useToast 
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext'; // <-- Import nécessaire

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null); // <-- Manquait dans votre code
  
  const toast = useToast();
  const { user } = useAuth(); // <-- On récupère l'user

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        // Appel IPC getAll
        const data = await window.electronAPI.documents.getAll(parseInt(user.id));
        setDocs(data);
      } catch (err) {
        console.error("Erreur docs:", err);
        toast({ status: 'error', title: "Erreur chargement", description: "Impossible de charger les documents" });
      }
    };
    fetchDocs();
  }, [user, toast]);

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

  const handleDelete = async (docId: string) => {
    if (!user || !confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    setDeletingId(docId); // Active le loading spinner poubelle
    try {
      // Appel IPC delete
      await window.electronAPI.documents.delete(parseInt(docId), parseInt(user.id));
      
      // Mise à jour locale de la liste
      setDocs(prev => prev.filter(d => d.id !== docId));
      
      toast({ status: "info", title: "Document supprimé" });

    } catch (error: any) {
      toast({ status: "error", title: "Erreur", description: error.message });
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
                
                <HStack width="full" spacing={2}>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="outline" 
                      width="full"
                      isLoading={openingId === doc.id}
                      onClick={() => handleOpenDocument(doc.id)}
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