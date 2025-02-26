import { ToastContainer, cssTransition } from 'react-toastify';
import 'animate.css';

function Notification() {
  const zoom = cssTransition({
    enter: 'animate__animated animate__flipInX',
    exit: 'animate__animated animate__fadeOut',
  });

  return (
    <ToastContainer
      position='bottom-left'
      hideProgressBar={true}
      closeOnClick={false}
      transition={zoom}
      autoClose={1000}
      closeButton={false}
      limit={3}
      pauseOnHover={false}
    />
  );
}

export default Notification;
