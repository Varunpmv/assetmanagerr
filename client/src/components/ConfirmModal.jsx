import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="flex-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={type === 'danger' ? 'text-danger' : 'text-warning'} />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p className="text-muted mb-8">{message}</p>

        <div className="flex gap-4">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} flex-1`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
