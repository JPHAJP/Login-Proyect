import React, { useState, useEffect, useRef } from 'react';
import { qrService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const QRDisplay = () => {
  const [currentQR, setCurrentQR] = useState(null);
  const [qrExpiry, setQrExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [loading, setLoading] = useState(true); // Inicializar como true para carga inicial
  const [autoRefreshing, setAutoRefreshing] = useState(false); // Estado para actualizaciones automáticas
  const intervalRef = useRef();
  const { showError, showInfo } = useToast();

  // Cargar QR inicial
  useEffect(() => {
    console.log('🚀 Iniciando QRDisplay...');
    loadCurrentQR();
    
    // Visibilidad de la página para reactivar cuando se vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visible, reiniciando timers...');
        // Solo reiniciar timers, no recargar QR inmediatamente
        startTimers();
      } else {
        console.log('📴 Página oculta, pausando timers...');
        clearAllTimers();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      console.log('🛑 Limpiando QRDisplay...');
      clearAllTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Iniciar timer cuando se actualiza qrExpiry
  useEffect(() => {
    if (qrExpiry) {
      console.log('⏰ QR expiry actualizado, iniciando timer...');
      startTimers();
    }
    return () => clearAllTimers();
  }, [qrExpiry]);

  const loadCurrentQR = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      console.log('🔄 Actualización automática del QR...');
      setAutoRefreshing(true);
    } else {
      setLoading(true);
      console.log('🔄 Cargando QR actual...');
    }
    
    try {
      const qrData = await qrService.getCurrentQR();
      console.log('✅ QR recibido:', qrData);
      setCurrentQR(qrData);
      
      if (qrData.expires_at) {
        // El servidor envía fecha en UTC (formato ISO con Z)
        // Asegurar que se interprete correctamente como UTC
        let expiry;
        
        // Parsear la fecha del servidor (que viene en UTC)
        expiry = new Date(qrData.expires_at);
        
        // TEMPORAL: Si detectamos que hay problema de zona horaria, 
        // ajustar manualmente (México es UTC-6)
        const timezoneOffset = new Date().getTimezoneOffset(); // minutos
        console.log('⏰ Zona horaria detectada:', timezoneOffset, 'minutos de diferencia con UTC');
        
        // Si estamos en zona UTC-6 (México), timezoneOffset será 360 minutos
        // El servidor está en UTC+0, así que no necesitamos ajuste si se parsea correctamente
        
        console.log('📅 DEBUG Fecha procesada:', {
          'Raw del servidor': qrData.expires_at,
          'Fecha parseada': expiry.toISOString(),
          'Hora local equivalente': expiry.toLocaleString(),
          'Timestamp UTC': expiry.getTime(),
          'Zona horaria offset (min)': expiry.getTimezoneOffset()
        });
        
        setQrExpiry(expiry);
        calculateTimeLeft(expiry);
      }
      
      if (isAutoRefresh) {
        showInfo('✅ Código QR actualizado automáticamente');
      }
      
    } catch (error) {
      console.error('❌ Error cargando QR:', error);
      showError('Error al cargar el código QR. Verifica que tengas permisos de administrador.');
    } finally {
      setLoading(false);
      setAutoRefreshing(false);
    }
  };

  const clearAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimers = () => {
    clearAllTimers();
    
    if (!qrExpiry) {
      console.log('⚠️ No hay qrExpiry, no se puede iniciar el timer');
      return;
    }
    
    console.log('▶️ Iniciando timer de expiración...');
    
    // Timer para el countdown de expiración del QR actual
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((qrExpiry - now) / 1000));
      setTimeLeft(diff);
      
      // Solo mostrar log cada 30 segundos para reducir spam
      if (diff % 30 === 0 || diff <= 10) {
        console.log(`⏰ QR expira en: ${diff}s`);
      }
      
      // Recargar QR cuando expire
      if (diff <= 0) {
        console.log('🔄 QR expirado, actualizando...');
        clearAllTimers();
        loadCurrentQR(true);
      }
    }, 1000);
  };

  const calculateTimeLeft = (expiry) => {
    // Obtener timestamp actual en UTC
    const now = new Date();
    
    // Ambos timestamps están en UTC (milisegundos desde epoch)
    // getTime() siempre devuelve UTC timestamp independientemente de zona horaria
    const expiryTime = expiry.getTime();
    const nowTime = now.getTime();
    
    const diffMs = expiryTime - nowTime;
    const diff = Math.max(0, Math.floor(diffMs / 1000));
    
    console.log('🕐 DEBUG Cálculo QR:', {
      'Expiry UTC': expiry.toISOString(),
      'Now Local': now.toISOString(), 
      'Now UTC equiv': new Date(nowTime).toISOString(),
      'Expiry timestamp': expiryTime,
      'Now timestamp': nowTime,
      'Diferencia ms': diffMs,
      'Diferencia seg': diff,
      'Diferencia min': (diff / 60).toFixed(2),
      'Offset zona (min)': now.getTimezoneOffset(),
      'Es futuro': diffMs > 0
    });
    
    setTimeLeft(diff);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualRefresh = () => {
    showInfo('Actualizando código QR...');
    loadCurrentQR(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">🎯 Código QR para Escaneo</h2>
              <p className="text-gray-600">
                Los usuarios deben escanear este código para registrar entrada/salida
              </p>
            </div>
            {autoRefreshing && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm font-medium">Actualizando...</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-600">Cargando código QR...</p>
          </div>
        ) : currentQR ? (
          <>
            {/* Imagen QR */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                {currentQR.qr_image ? (
                  <img 
                    src={currentQR.qr_image.startsWith('data:') ? currentQR.qr_image : `data:image/png;base64,${currentQR.qr_image}`}
                    alt="Código QR de Acceso"
                    className="w-80 h-80 border-4 border-cyan-500 rounded-2xl shadow-xl mx-auto"
                    onError={(e) => {
                      console.error('Error loading QR image:', e);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <div className="w-80 h-80 border-4 border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 text-gray-500 mx-auto">
                    <p className="mb-4">Generando código QR...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  </div>
                )}
            
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <span>ESCANEAR PARA ACCESO</span>
                </div>
              </div>
              
              {/* Código en texto */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-md mx-auto">
                <label className="block font-semibold text-gray-800 mb-2 text-sm">Código QR:</label>
                <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-3">
                  <span className="font-mono text-sm text-gray-800 break-all flex-1">{currentQR.code}</span>
                  <button 
                    className="bg-cyan-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
                    onClick={() => {
                      navigator.clipboard.writeText(currentQR.code);
                      showInfo('Código copiado al portapapeles');
                    }}
                    title="Copiar código"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Timer de expiración */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">⏰ Este código expira en:</h4>
                <span className={`text-3xl font-bold block ${timeLeft <= 60 ? 'text-red-500' : timeLeft <= 120 ? 'text-orange-500' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ${timeLeft <= 60 ? 'bg-red-500' : timeLeft <= 120 ? 'bg-orange-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.max(0, (timeLeft / 300) * 100)}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <small className="text-gray-600">
                  <strong>Válido hasta:</strong> {qrExpiry?.toLocaleString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </small>
                <br />
                <small className="text-gray-500">
                  Se actualizará automáticamente al expirar
                </small>
              </div>
            </div>

            {/* Botón de actualización manual */}
            <div className="text-center mb-6">
              <button 
                className={`bg-green-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleManualRefresh}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </div>
                ) : (
                  <>🔄 Actualizar QR Manualmente</>
                )}
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📋 Instrucciones para usuarios:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li>Abre la aplicación en tu dispositivo móvil</li>
                <li>Ve a la sección "Control de Acceso"</li>
                <li>Selecciona "Entrada" o "Salida"</li>
                <li>Escanea este código QR o copia el código manualmente</li>
                <li>Confirma la acción</li>
              </ol>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-800">
                <strong className="text-yellow-800">Nota para administradores:</strong> 
                Este código se renueva automáticamente cada 5 minutos por seguridad. 
                Asegúrate de que la pantalla esté visible para los usuarios.
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">❌ No se pudo cargar el código QR</p>
            <button 
              className="bg-red-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-red-600 transition-all duration-300 hover:scale-105"
              onClick={loadCurrentQR}
            >
              🔄 Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRDisplay;