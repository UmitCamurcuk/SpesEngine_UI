import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

// Interfaces
interface AssociationRule {
  _id: string;
  code: string;
  name: any;
  description?: any;
  associationId: any;
  sourceItemTypeId: any;
  targetItemTypeId: any;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  filterCriteria?: {
    categories?: any[];
    families?: any[];
    attributeFilters?: any[];
    customQuery?: any;
  };
  validationRules: any[];

  priority: number;
  isActive: boolean;
  isRequired: boolean;
  cascadeDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssociationRuleManagerProps {
  sourceItemTypeCode?: string;
  onRuleSelect?: (rule: AssociationRule) => void;
  mode?: 'full' | 'selector';
}

// Mock API service (bu kısmı gerçek API servisi ile değiştireceksiniz)
const associationRuleService = {
  async getRules(params: any = {}) {
    // Gerçek API çağrısı yapılacak
    const response = await fetch('/api/association-rules?' + new URLSearchParams(params));
    return await response.json();
  },

  async getRule(code: string) {
    const response = await fetch(`/api/association-rules/${code}`);
    return await response.json();
  },

  async createRule(ruleData: any) {
    const response = await fetch('/api/association-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleData)
    });
    return await response.json();
  },

  async updateRule(code: string, ruleData: any) {
    const response = await fetch(`/api/association-rules/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleData)
    });
    return await response.json();
  },

  async deleteRule(code: string) {
    const response = await fetch(`/api/association-rules/${code}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
};

const AssociationRuleManager: React.FC<AssociationRuleManagerProps> = ({
  sourceItemTypeCode,
  onRuleSelect,
  mode = 'full'
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AssociationRule | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    relationshipType: '',
    isActive: true,
    sourceItemType: sourceItemTypeCode || ''
  });

  // Load rules
  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage
      };

      if (filters.sourceItemType) {
        params.sourceItemTypeCode = filters.sourceItemType;
      }
      if (filters.relationshipType) {
        params.relationshipType = filters.relationshipType;
      }
      if (filters.isActive !== undefined) {
        params.isActive = filters.isActive;
      }

      const response = await associationRuleService.getRules(params);
      
      if (response.success) {
        setRules(response.data.rules || []);
      } else {
        enqueueSnackbar('Kurallar yüklenirken hata oluştu', { variant: 'error' });
      }
    } catch (error) {
      console.error('Rules loading error:', error);
      enqueueSnackbar('Kurallar yüklenirken hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  // Filter rules
  useEffect(() => {
    let filtered = [...rules];

    if (filters.search) {
      filtered = filtered.filter(rule =>
        rule.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        (rule.name?.tr || rule.name?.en || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredRules(filtered);
  }, [rules, filters.search]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Form handlers
  const handleOpenDialog = (rule?: AssociationRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        code: rule.code,
        name: rule.name,
        description: rule.description,
        associationId: rule.associationId,
        sourceItemTypeCode: '', // API'den doldurulacak
        targetItemTypeCode: '', // API'den doldurulacak
        relationshipType: rule.relationshipType,
        filterCriteria: rule.filterCriteria || {},
        validationRules: rule.validationRules || [],

        priority: rule.priority,
        isRequired: rule.isRequired,
        cascadeDelete: rule.cascadeDelete,
        isActive: rule.isActive
      });
    } else {
      setEditingRule(null);
      setFormData({
        code: '',
        relationshipType: 'many-to-many',
        priority: 0,
        isRequired: false,
        cascadeDelete: false,
        isActive: true,
        filterCriteria: {},
        validationRules: [],

      });
    }
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    setFormData({});
    setErrors({});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let response;
      if (editingRule) {
        response = await associationRuleService.updateRule(editingRule.code, formData);
      } else {
        response = await associationRuleService.createRule(formData);
      }

      if (response.success) {
        enqueueSnackbar(
          editingRule ? 'Kural başarıyla güncellendi' : 'Kural başarıyla oluşturuldu',
          { variant: 'success' }
        );
        handleCloseDialog();
        loadRules();
      } else {
        enqueueSnackbar(response.message || 'İşlem başarısız', { variant: 'error' });
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar('Kaydetme işlemi başarısız', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rule: AssociationRule) => {
    if (!window.confirm('Bu kuralı silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      const response = await associationRuleService.deleteRule(rule.code);
      
      if (response.success) {
        enqueueSnackbar('Kural başarıyla silindi', { variant: 'success' });
        loadRules();
      } else {
        enqueueSnackbar(response.message || 'Silme işlemi başarısız', { variant: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('Silme işlemi başarısız', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRuleClick = (rule: AssociationRule) => {
    if (mode === 'selector' && onRuleSelect) {
      onRuleSelect(rule);
    }
  };

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'primary';
      case 'one-to-many': return 'secondary';
      case 'many-to-one': return 'warning';
      case 'many-to-many': return 'success';
      default: return 'default';
    }
  };

  if (mode === 'selector') {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Association Kuralları
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { elevation: 4 }
                  }}
                  onClick={() => handleRuleClick(rule)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">
                        {rule.name?.tr || rule.name?.en || rule.code}
                      </Typography>
                      <Chip
                        label={rule.relationshipType}
                        color={getRelationshipTypeColor(rule.relationshipType) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {rule.description?.tr || rule.description?.en || 'Açıklama yok'}
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={rule.isActive ? 'Aktif' : 'Pasif'}
                        color={rule.isActive ? 'success' : 'error'}
                        size="small"
                      />
                      {rule.isRequired && (
                        <Chip
                          label="Zorunlu"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Association Kuralları"
        action={
          <Box>
            <IconButton onClick={() => setFilterOpen(!filterOpen)}>
              <FilterIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Yeni Kural
            </Button>
          </Box>
        }
      />

      <CardContent>
        {/* Filters */}
        <Accordion expanded={filterOpen} onChange={() => setFilterOpen(!filterOpen)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Filtreler</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Ara"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>İlişki Türü</InputLabel>
                  <Select
                    value={filters.relationshipType}
                    onChange={(e) => setFilters(prev => ({ ...prev, relationshipType: e.target.value }))}
                  >
                    <MenuItem value="">Hepsi</MenuItem>
                    <MenuItem value="one-to-one">One-to-One</MenuItem>
                    <MenuItem value="one-to-many">One-to-Many</MenuItem>
                    <MenuItem value="many-to-one">Many-to-One</MenuItem>
                    <MenuItem value="many-to-many">Many-to-Many</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.isActive}
                      onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Sadece Aktif"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Rules Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Ad</TableCell>
                  <TableCell>İlişki Türü</TableCell>
                  <TableCell>Kaynak ItemType</TableCell>
                  <TableCell>Hedef ItemType</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule._id}>
                    <TableCell>{rule.code}</TableCell>
                    <TableCell>
                      {rule.name?.tr || rule.name?.en || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.relationshipType}
                        color={getRelationshipTypeColor(rule.relationshipType) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {rule.sourceItemTypeId?.code || '-'}
                    </TableCell>
                    <TableCell>
                      {rule.targetItemTypeId?.code || '-'}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={rule.isActive ? 'Aktif' : 'Pasif'}
                          color={rule.isActive ? 'success' : 'error'}
                          size="small"
                        />
                        {rule.isRequired && (
                          <Chip
                            label="Zorunlu"
                            color="warning"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(rule)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(rule)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={rules.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
              labelRowsPerPage="Sayfa başına satır"
            />
          </>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRule ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kural Kodu"
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                error={!!errors.code}
                helperText={errors.code}
                disabled={!!editingRule}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.relationshipType}>
                <InputLabel>İlişki Türü</InputLabel>
                <Select
                  value={formData.relationshipType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationshipType: e.target.value }))}
                >
                  <MenuItem value="one-to-one">One-to-One</MenuItem>
                  <MenuItem value="one-to-many">One-to-Many</MenuItem>
                  <MenuItem value="many-to-one">Many-to-One</MenuItem>
                  <MenuItem value="many-to-many">Many-to-Many</MenuItem>
                </Select>
                {errors.relationshipType && (
                  <FormHelperText>{errors.relationshipType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ayarlar
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Aktif"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRequired || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  />
                }
                label="Zorunlu"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.cascadeDelete || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, cascadeDelete: e.target.checked }))}
                  />
                }
                label="Cascade Delete"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Öncelik"
                type="number"
                value={formData.priority || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </Grid>
          </Grid>

          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AssociationRuleManager;
