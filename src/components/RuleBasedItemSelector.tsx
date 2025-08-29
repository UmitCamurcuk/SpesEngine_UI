import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

// Interfaces
interface FilteredItem {
  _id: string;
  itemType: any;
  family: any;
  category: any;
  attributes: Record<string, any>;
  matchScore?: number;
  matchReasons?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssociationRule {
  _id: string;
  code: string;
  name: any;
  description?: any;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  filterCriteria?: {
    categories?: any[];
    families?: any[];
    attributeFilters?: any[];
  };
  validationRules: any[];

  isRequired: boolean;
}

interface AssociationMetadata {
  rule: AssociationRule;
  availableCount: number;
  selectedCount: number;
  canAddMore: boolean;
  validationStatus: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions?: string[];
  };
}

interface RuleBasedItemSelectorProps {
  sourceItemId: string;
  ruleCode: string;
  onItemsSelected?: (items: FilteredItem[]) => void;
  onAssociationCreated?: () => void;
  mode?: 'modal' | 'inline';
  open?: boolean;
  onClose?: () => void;
}

// Mock API service
const ruleBasedService = {
  async getFilteredItems(sourceItemId: string, ruleCode: string, params: any = {}) {
    const response = await fetch(`/api/association-rules/${ruleCode}/items/${sourceItemId}?` + new URLSearchParams(params));
    return await response.json();
  },

  async getAssociationMetadata(sourceItemId: string, ruleCode: string) {
    const response = await fetch(`/api/association-rules/${ruleCode}/metadata/${sourceItemId}`);
    return await response.json();
  },

  async createAssociation(sourceItemId: string, ruleCode: string, targetItemIds: string[]) {
    const response = await fetch(`/api/association-rules/${ruleCode}/associate/${sourceItemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetItemIds })
    });
    return await response.json();
  }
};

const RuleBasedItemSelector: React.FC<RuleBasedItemSelectorProps> = ({
  sourceItemId,
  ruleCode,
  onItemsSelected,
  onAssociationCreated,
  mode = 'modal',
  open = false,
  onClose
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [items, setItems] = useState<FilteredItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<FilteredItem[]>([]);
  const [metadata, setMetadata] = useState<AssociationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    family: '',
    sortBy: 'matchScore',
    sortOrder: 'desc',
    showOnlyTopMatches: false
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load metadata
  const loadMetadata = useCallback(async () => {
    try {
      const response = await ruleBasedService.getAssociationMetadata(sourceItemId, ruleCode);
      if (response.success) {
        setMetadata(response.data);
      }
    } catch (error) {
      console.error('Metadata loading error:', error);
    }
  }, [sourceItemId, ruleCode]);

  // Load filtered items
  const loadItems = useCallback(async () => {
    setSearching(true);
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        populate: true
      };

      if (searchQuery) {
        params.searchQuery = searchQuery;
      }

      if (filters.category || filters.family) {
        params.additionalFilters = JSON.stringify({
          ...(filters.category && { category: filters.category }),
          ...(filters.family && { family: filters.family })
        });
      }

      const response = await ruleBasedService.getFilteredItems(sourceItemId, ruleCode, params);
      
      if (response.success) {
        let fetchedItems = response.data.items || [];

        // Filtreleme ve sıralama
        if (filters.showOnlyTopMatches) {
          fetchedItems = fetchedItems.filter((item: FilteredItem) => 
            (item.matchScore || 0) > 10
          );
        }

        // Sıralama
        fetchedItems.sort((a: FilteredItem, b: FilteredItem) => {
          const aValue = a[filters.sortBy as keyof FilteredItem] || 0;
          const bValue = b[filters.sortBy as keyof FilteredItem] || 0;
          
          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });

        setItems(fetchedItems);
      } else {
        enqueueSnackbar('İtemler yüklenirken hata oluştu', { variant: 'error' });
      }
    } catch (error) {
      console.error('Items loading error:', error);
      enqueueSnackbar('İtemler yüklenirken hata oluştu', { variant: 'error' });
    } finally {
      setSearching(false);
    }
  }, [sourceItemId, ruleCode, page, rowsPerPage, searchQuery, filters, enqueueSnackbar]);

  // Load data on mount and dependency changes
  useEffect(() => {
    if (open || mode === 'inline') {
      loadMetadata();
      loadItems();
    }
  }, [loadMetadata, loadItems, open, mode]);

  // Handle item selection
  const handleItemToggle = (item: FilteredItem) => {
    const isSelected = selectedItems.some(selected => selected._id === item._id);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected => selected._id !== item._id));
    } else {
      // Check if can add more based on relationship type
      if (metadata?.rule.relationshipType === 'one-to-one' || metadata?.rule.relationshipType === 'many-to-one') {
        setSelectedItems([item]);
      } else {
        if (metadata?.canAddMore) {
          setSelectedItems(prev => [...prev, item]);
        } else {
          enqueueSnackbar('Daha fazla item ekleyemezsiniz', { variant: 'warning' });
        }
      }
    }
  };

  const handleSelectAll = () => {
    if (metadata?.rule.relationshipType === 'one-to-one' || metadata?.rule.relationshipType === 'many-to-one') {
      return; // Single selection only
    }

    const visibleItems = items.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const notSelectedItems = visibleItems.filter(item => 
      !selectedItems.some(selected => selected._id === item._id)
    );
    
    setSelectedItems(prev => [...prev, ...notSelectedItems]);
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  // Handle association creation
  const handleCreateAssociation = async () => {
    if (selectedItems.length === 0) {
      enqueueSnackbar('En az bir item seçmelisiniz', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const targetItemIds = selectedItems.map(item => item._id);
      const response = await ruleBasedService.createAssociation(sourceItemId, ruleCode, targetItemIds);
      
      if (response.success) {
        enqueueSnackbar('Association başarıyla oluşturuldu', { variant: 'success' });
        setSelectedItems([]);
        loadMetadata(); // Refresh metadata
        
        if (onAssociationCreated) {
          onAssociationCreated();
        }
        
        if (mode === 'modal' && onClose) {
          onClose();
        }
      } else {
        enqueueSnackbar(response.message || 'Association oluşturulamadı', { variant: 'error' });
      }
    } catch (error) {
      console.error('Association creation error:', error);
      enqueueSnackbar('Association oluşturulamadı', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Get item display name
  const getItemDisplayName = (item: FilteredItem) => {
    return item.attributes?.name || item.attributes?.code || item._id;
  };

  // Get match score color
  const getMatchScoreColor = (score: number = 0) => {
    if (score >= 20) return 'success';
    if (score >= 10) return 'warning';
    return 'error';
  };

  // Validation status component
  const ValidationStatus = () => {
    if (!metadata?.validationStatus) return null;

    const { isValid, errors, warnings, suggestions } = metadata.validationStatus;

    return (
      <Box mb={2}>
        {!isValid && errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Validation Hataları:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Uyarılar:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {suggestions && suggestions.length > 0 && (
          <Alert severity="info">
            <Typography variant="subtitle2">Öneriler:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Box>
    );
  };

  // Render content
  const renderContent = () => (
    <Box>
      {/* Metadata Info */}
      {metadata && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography variant="h6">
                  {metadata.rule.name?.tr || metadata.rule.name?.en || metadata.rule.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metadata.rule.description?.tr || metadata.rule.description?.en}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">İlişki Türü</Typography>
                <Chip label={metadata.rule.relationshipType} color="primary" size="small" />
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">Mevcut</Typography>
                <Typography variant="h6">{metadata.availableCount}</Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">Seçili</Typography>
                <Typography variant="h6">{metadata.selectedCount}</Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">Durum</Typography>
                <Chip 
                  label={metadata.canAddMore ? 'Eklenebilir' : 'Limit Doldu'} 
                  color={metadata.canAddMore ? 'success' : 'warning'} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={1}>
                {metadata.rule.isRequired && (
                  <Tooltip title="Bu association zorunludur">
                    <Chip label="Zorunlu" color="error" size="small" />
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <ValidationStatus />

      {/* Search and Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="İtem ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtreler
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              {selectedItems.length > 0 && (
                <Typography variant="body2">
                  {selectedItems.length} item seçili
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  disabled={metadata?.rule.relationshipType === 'one-to-one' || metadata?.rule.relationshipType === 'many-to-one'}
                >
                  Tümünü Seç
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleDeselectAll}
                  disabled={selectedItems.length === 0}
                >
                  Seçimi Temizle
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Accordion expanded={showFilters} onChange={() => setShowFilters(!showFilters)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Gelişmiş Filtreler</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sıralama</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    >
                      <MenuItem value="matchScore">Eşleşme Puanı</MenuItem>
                      <MenuItem value="createdAt">Oluşturma Tarihi</MenuItem>
                      <MenuItem value="updatedAt">Güncelleme Tarihi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sıra</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                    >
                      <MenuItem value="desc">Azalan</MenuItem>
                      <MenuItem value="asc">Artan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.showOnlyTopMatches}
                        onChange={(e) => setFilters(prev => ({ ...prev, showOnlyTopMatches: e.target.checked }))}
                      />
                    }
                    label="Sadece Yüksek Eşleşmeleri Göster"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent>
          {searching ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.length > 0 && items.every(item => 
                          selectedItems.some(selected => selected._id === item._id)
                        )}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                        onChange={() => {
                          if (selectedItems.length === items.length) {
                            handleDeselectAll();
                          } else {
                            handleSelectAll();
                          }
                        }}
                        disabled={metadata?.rule.relationshipType === 'one-to-one' || metadata?.rule.relationshipType === 'many-to-one'}
                      />
                    </TableCell>
                    <TableCell>İtem</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Aile</TableCell>
                    <TableCell>Eşleşme Puanı</TableCell>
                    <TableCell>Eşleşme Nedenleri</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item) => {
                    const isSelected = selectedItems.some(selected => selected._id === item._id);
                    
                    return (
                      <TableRow 
                        key={item._id} 
                        selected={isSelected}
                        hover
                        onClick={() => handleItemToggle(item)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {getItemDisplayName(item).charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {getItemDisplayName(item)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.attributes?.code || item._id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item.category?.name?.tr || item.category?.name?.en || '-'}
                        </TableCell>
                        <TableCell>
                          {item.family?.name?.tr || item.family?.name?.en || '-'}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Badge
                              badgeContent={item.matchScore || 0}
                              color={getMatchScoreColor(item.matchScore)}
                              sx={{ mr: 1 }}
                            >
                              <StarIcon color={getMatchScoreColor(item.matchScore)} />
                            </Badge>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {item.matchReasons?.map((reason, index) => (
                              <Chip
                                key={index}
                                label={reason}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={items.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                labelRowsPerPage="Sayfa başına satır"
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  if (mode === 'inline') {
    return (
      <Box>
        {renderContent()}
        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            onClick={handleCreateAssociation}
            disabled={selectedItems.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            Association Oluştur ({selectedItems.length})
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Kural Tabanlı İtem Seçici
          </Typography>
          <Chip label={ruleCode} color="primary" variant="outlined" />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 1 }}>
        {renderContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateAssociation}
          disabled={selectedItems.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          Association Oluştur ({selectedItems.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RuleBasedItemSelector;
