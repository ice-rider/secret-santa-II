import { createSignal, onCleanup } from 'solid-js';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const Notification = (props: NotificationProps) => {
  const [open, setOpen] = createSignal(true);

  // Auto close the notification after specified duration
  if (props.duration !== 0) {
    const timer = setTimeout(() => {
      setOpen(false);
    }, props.duration || 3000);

    // Clean up timer on component unmount
    onCleanup(() => {
      if (timer) clearTimeout(timer);
    });
  }

  const handleClose = () => {
    setOpen(false);
  };

  const getBgColor = () => {
    switch (props.type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-green-100 border-green-400 text-green-700';
    }
  };

  if (!open()) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      'z-index': 9999,
      'min-width': '300px'
    }}>
      <div class={`border-l-4 ${getBgColor()} p-4 rounded`}>
        <div class="flex justify-between items-start">
          <div class="flex-grow">{props.message}</div>
          <button 
            onClick={handleClose}
            class="ml-4 text-black opacity-70 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;