import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PropTypes from 'prop-types';
import MainCard from '../MainCard';
import { getCurrentUser } from '../../services/authService';
import {
  createFailureForecastOverhaulEvent,
  undoFailureForecastOverhaulEvent,
  deleteFailureForecastOverhaulEvent
} from '../../utils/api';
import { COD_DATE, PLANNED_CYCLE_YEARS } from '../../utils/failureForecastCalibration';

// COD_DATE is enforced authoritatively by the backend (OVERHAUL_COD_DATE in
// externalController.js) -- used here only for the date-picker's min
// attribute and the client-side error message shown before a round-trip.

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const fmtDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const yearsSince = (value) => (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

/**
 * Admin control for logging/undoing a completed major overhaul (Turn
 * Around) -- the event that resets the SoH curve's anchor back to 100%.
 * This is a real, permanently-logged operational event (soft-delete only),
 * not a cosmetic UI toggle -- see backend/controllers/externalController.js
 * (createFailureForecastOverhaulEvent) and
 * AI_Pertasmart_V3/docs/argumen_horizon_forecast_kegagalan.md §7.4.
 *
 * Status/history (from `events`) is shown to any signed-in viewer; only the
 * reset/undo buttons are admin-gated (`getCurrentUser().role`). That's a UX
 * guard only -- the real gate is the backend's authenticateToken +
 * requireRole('admin'), same split ProtectedRoute.jsx documents for the
 * rest of this app.
 */
const OverhaulResetControl = ({ events = [], loading = false, onChanged }) => {
  const isAdmin = getCurrentUser()?.role === 'admin';

  const [dialog, setDialog] = useState(null); // null | 'reset' | 'undo' | 'delete'
  const [effectiveDate, setEffectiveDate] = useState(todayIsoDate());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  // Which row 'delete' targets -- unlike undo (always "the latest active"),
  // hard-delete is per-row, so the dialog needs to remember which one.
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Newest event without undone_at -- same "latest active wins" rule the
  // AI-side worker itself uses when picking the anchor.
  const activeEvent =
    events
      .filter((e) => !e.undone_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

  const openReset = () => {
    setEffectiveDate(todayIsoDate());
    setFormError(null);
    setDialog('reset');
  };

  const openUndo = () => {
    setFormError(null);
    setDialog('undo');
  };

  const openDelete = (event) => {
    setFormError(null);
    setDeleteTarget(event);
    setDialog('delete');
  };

  const closeDialog = () => {
    if (!submitting) {
      setDialog(null);
      setDeleteTarget(null);
    }
  };

  const handleConfirmReset = async () => {
    if (!effectiveDate) {
      setFormError('Tanggal wajib diisi');
      return;
    }
    if (effectiveDate < COD_DATE) {
      setFormError(`Tanggal tidak boleh sebelum COD (${fmtDate(COD_DATE)})`);
      return;
    }
    if (effectiveDate > todayIsoDate()) {
      setFormError('Tanggal tidak boleh di masa depan -- catat setelah overhaul benar-benar selesai');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await createFailureForecastOverhaulEvent(effectiveDate);
      setDialog(null);
      onChanged?.();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal mencatat event overhaul');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUndo = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      await undoFailureForecastOverhaulEvent();
      setDialog(null);
      onChanged?.();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal membatalkan event overhaul');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await deleteFailureForecastOverhaulEvent(deleteTarget.id);
      setDialog(null);
      setDeleteTarget(null);
      onChanged?.();
    } catch (err) {
      // Backend refuses with 409 if this row somehow became active again
      // between the list loading and the click (e.g. an undo got reverted
      // some other way) -- surfaced as-is rather than assumed to be a
      // network error.
      setFormError(err.response?.data?.message || err.message || 'Gagal menghapus event overhaul');
    } finally {
      setSubmitting(false);
    }
  };

  const cycleNote = activeEvent
    ? `${yearsSince(activeEvent.created_at).toFixed(1)} tahun sejak overhaul aktif terakhir -- referensi siklus rencana industri: ~${PLANNED_CYCLE_YEARS} tahun (rentang 2–6 tahun), bukan aturan otomatis, murni pembanding.`
    : `Belum ada overhaul mayor tercatat sejak COD (${fmtDate(COD_DATE)}). Referensi siklus rencana industri: ~${PLANNED_CYCLE_YEARS} tahun (rentang 2–6 tahun).`;

  return (
    <MainCard sx={{ width: '100%', mt: 2 }} title="Event Overhaul Mayor / Turn Around">
      <Alert severity={activeEvent ? 'info' : 'warning'} sx={{ mb: 1.5 }}>
        {activeEvent
          ? `SoH direset sejak overhaul ${fmtDate(activeEvent.created_at)} -- proyeksi dihitung ulang dari titik ini.`
          : `Belum ada event overhaul aktif -- proyeksi dihitung sejak COD (${fmtDate(COD_DATE)}).`}
      </Alert>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {cycleNote}
      </Typography>

      {isAdmin ? (
        <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Button variant="contained" startIcon={<RestartAltIcon />} onClick={openReset} disabled={loading}>
            Catat Overhaul Selesai (Reset SoH)
          </Button>
          <Button variant="outlined" color="warning" startIcon={<UndoIcon />} onClick={openUndo} disabled={loading || !activeEvent}>
            Batalkan Event Terakhir
          </Button>
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Hanya akun admin yang bisa mencatat/membatalkan event overhaul.
        </Typography>
      )}

      {events.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Riwayat event
          </Typography>
          <Stack spacing={0.75}>
            {events.slice(0, 10).map((e) => (
              <Stack key={e.id} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={e.undone_at ? 'Dibatalkan' : 'Aktif'}
                  color={e.undone_at ? 'default' : 'success'}
                  variant={e.undone_at ? 'outlined' : 'filled'}
                />
                <Typography variant="body2">{fmtDate(e.created_at)}</Typography>
                {e.undone_at && (
                  <Typography variant="caption" color="text.secondary">
                    (dibatalkan {fmtDate(e.undone_at)})
                  </Typography>
                )}
                {/* Hard-delete only ever offered for an already-undone row --
                    an Aktif row has no delete affordance at all, it must be
                    undone first (separate, already-audited step). */}
                {isAdmin && e.undone_at && (
                  <Tooltip title="Hapus permanen (event ini sudah dibatalkan)">
                    <IconButton size="small" onClick={() => openDelete(e)} disabled={loading}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      <Dialog open={dialog === 'reset'} onClose={closeDialog}>
        <DialogTitle>Catat Overhaul Mayor Selesai</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ini bukan aksi kosmetik -- SoH akan direset ke 100% dan proyeksi umur pakai dihitung ulang dari
            tanggal ini pada run berikutnya (±60 detik). Gunakan HANYA setelah overhaul mayor/Turn Around
            benar-benar selesai (bukan inspeksi tahunan/borescope).
          </DialogContentText>
          <TextField
            label="Tanggal overhaul selesai"
            type="date"
            fullWidth
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: COD_DATE, max: todayIsoDate() } }}
          />
          {formError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={submitting}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleConfirmReset} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Konfirmasi Reset'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'undo'} onClose={closeDialog}>
        <DialogTitle>Batalkan Event Overhaul Terakhir?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {activeEvent
              ? `Event overhaul ${fmtDate(activeEvent.created_at)} akan ditandai dibatalkan (bukan dihapus, riwayat tetap tersimpan). Proyeksi akan kembali dihitung dari anchor sebelumnya.`
              : 'Tidak ada event aktif untuk dibatalkan.'}
          </DialogContentText>
          {formError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={submitting}>
            Batal
          </Button>
          <Button variant="contained" color="warning" onClick={handleConfirmUndo} disabled={submitting || !activeEvent}>
            {submitting ? 'Memproses...' : 'Ya, Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'delete'} onClose={closeDialog}>
        <DialogTitle>Hapus Permanen Event Overhaul?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `Event overhaul ${fmtDate(deleteTarget.created_at)} (status: dibatalkan) akan dihapus PERMANEN dari riwayat -- tidak bisa dikembalikan. Cuma untuk beresin entri test/salah input, bukan buat event asli.`
              : 'Tidak ada event yang dipilih.'}
          </DialogContentText>
          {formError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={submitting}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={submitting || !deleteTarget}>
            {submitting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

OverhaulResetControl.propTypes = {
  events: PropTypes.array,
  loading: PropTypes.bool,
  onChanged: PropTypes.func
};

export default OverhaulResetControl;
