import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { qrService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const QRScanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [accessType, setAccessType] = useState('entry'); // 'entry' o 'exit'
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' o 'manual'
  const [cameraStarted, setCameraStarted] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const { showSuccess, showError, showInfo } = useToast();

  // Verificar disponibilidad de cámara al montar
  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setScannerMode('manual');
        showInfo('Cámara no disponible. Usando modo manual.');
      }
    } catch (error) {
      setHasCamera(false);
      setScannerMode('manual');
      showError('Error al acceder a la cámara. Usando modo manual.');
    }
  };

  const startCamera = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result && result.data) {
            handleQRDetected(result.data);
          }
        },
        {
          onDecodeError: (error) => {
            // Silenciar errores de decodificación normales
            console.log('Buscando código QR...');
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setCameraStarted(true);
      showInfo('Cámara iniciada. Apunta al código QR.');
    } catch (error) {
      console.error('Error starting camera:', error);
      showError('Error al iniciar la cámara. Usando modo manual.');
      setScannerMode('manual');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setCameraStarted(false);
  };

  const handleQRDetected = (detectedCode) => {
    setQrCode(detectedCode);
    stopCamera();
    showSuccess('¡Código QR detectado!');
    
    // Auto-procesar si el código es válido
    setTimeout(() => {
      handleScan(detectedCode);
    }, 500);
  };

  const toggleScannerMode = () => {
    if (scannerMode === 'camera') {
      stopCamera();
      setScannerMode('manual');
    } else {
      setScannerMode('camera');
      if (hasCamera) {
        setTimeout(() => startCamera(), 100);
      }
    }
  };

  const handleScan = async (codeToScan = null) => {
    const code = codeToScan || qrCode.trim();
    if (!code) {
      showError('Por favor, escanea o ingresa el código QR');
      return;
    }

    setIsScanning(true);
    try {
      const response = await qrService.scanQR(code, accessType);
      
      if (accessType === 'entry') {
        showSuccess('✅ Entrada registrada correctamente');
        showInfo('Recuerda registrar tu salida cuando te vayas');
      } else {
        showSuccess('✅ Salida registrada correctamente');
        showInfo('¡Hasta la próxima!');
      }

      setLastScan({
        type: accessType,
        timestamp: new Date(),
        message: response.message,
        access_log: response.access_log
      });

      // Limpiar el código después del escaneo exitoso
      setQrCode('');

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al procesar el escaneo';
      showError(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleQrCodeChange = (e) => {
    setQrCode(e.target.value);
  };

  const getInstructions = () => {
    if (scannerMode === 'camera') {
      return accessType === 'entry' 
        ? 'Usa la cámara para escanear el código QR y registrar tu entrada'
        : 'Usa la cámara para escanear el código QR y registrar tu salida';
    } else {
      return accessType === 'entry' 
        ? 'Ingresa el código QR manualmente para registrar tu entrada'
        : 'Ingresa el código QR manualmente para registrar tu salida';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casa-cyan via-white to-casa-purple p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-casa-cyan to-casa-purple p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl">
                🔐
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Control de Acceso</h1>
            <p className="text-center text-white text-opacity-90">
              Registra tu entrada o salida de forma segura
            </p>
          </div>

          <div className="p-8">
            {/* Botón de instrucciones colapsable */}
            <div className="mb-8">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <span className="font-semibold text-gray-800">¿Cómo usar el sistema?</span>
                </div>
                <div className={`transform transition-transform duration-200 ${showInstructions ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              
              {/* Instrucciones colapsables */}
              <div className={`transition-all duration-300 overflow-hidden ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📱</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Pasos a seguir:</h3>
                      <ol className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-casa-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                          <span>Selecciona si vas a <strong>entrar</strong> o <strong>salir</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-casa-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                          <span>Usa la <strong>cámara</strong> para escanear el código QR automáticamente</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-casa-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                          <span>O cambia a <strong>modo manual</strong> para ingresar el código</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-casa-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                          <span>El acceso se registrará automáticamente</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de modo de acceso */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Tipo de Acceso</h3>
              <div className="flex gap-4 max-w-md mx-auto">
                <button 
                  className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    accessType === 'entry' 
                      ? 'bg-green-500 text-white border-green-500 shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                  onClick={() => setAccessType('entry')}
                >
                  <div className="text-2xl mb-2">📥</div>
                  Entrada
                </button>
                <button 
                  className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    accessType === 'exit' 
                      ? 'bg-red-500 text-white border-red-500 shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50'
                  }`}
                  onClick={() => setAccessType('exit')}
                >
                  <div className="text-2xl mb-2">📤</div>
                  Salida
                </button>
              </div>
            </div>

            {/* Selector de método de escaneo */}
            {hasCamera && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Método de Escaneo</h3>
                <div className="flex gap-4 max-w-md mx-auto">
                  <button 
                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 ${
                      scannerMode === 'camera' 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={toggleScannerMode}
                  >
                    <div className="text-2xl mb-2">📷</div>
                    Cámara
                  </button>
                  <button 
                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 ${
                      scannerMode === 'manual' 
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onClick={toggleScannerMode}
                  >
                    <div className="text-2xl mb-2">⌨️</div>
                    Manual
                  </button>
                </div>
              </div>
            )}

            {/* Instrucciones específicas */}
            <div className="mb-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-gray-700 font-medium">{getInstructions()}</p>
              </div>
            </div>

            {/* Escáner de cámara */}
            {scannerMode === 'camera' && hasCamera && (
              <div className="mb-8">
                <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
                  <div className="relative">
                    <video 
                      ref={videoRef}
                      className="w-full h-80 object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-4 border-white border-opacity-50 rounded-xl">
                        <div className="w-full h-full border-4 border-casa-cyan animate-pulse rounded-lg"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                        Centra el código QR en el marco
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  {!cameraStarted ? (
                    <button 
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={startCamera}
                      disabled={isScanning}
                    >
                      <span className="text-xl mr-2">📷</span>
                      Iniciar Cámara
                    </button>
                  ) : (
                    <button 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={stopCamera}
                      disabled={isScanning}
                    >
                      <span className="text-xl mr-2">⏹️</span>
                      Detener Cámara
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Input manual para código QR */}
            {scannerMode === 'manual' && (
              <div className="mb-8">
                <div className="max-w-md mx-auto">
                  <label htmlFor="qrCode" className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                    Código QR:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="qrCode"
                      value={qrCode}
                      onChange={handleQrCodeChange}
                      placeholder="Ingresa o pega el código QR aquí..."
                      className="w-full px-4 py-3 pr-12 text-lg border-2 border-gray-300 rounded-xl focus:border-casa-cyan focus:ring-2 focus:ring-casa-cyan focus:ring-opacity-20 transition-all duration-200"
                      disabled={isScanning}
                    />
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      onClick={() => setQrCode('')}
                      type="button"
                      disabled={!qrCode || isScanning}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <button 
                    className={`w-full mt-6 py-4 px-6 font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      accessType === 'entry'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    }`}
                    onClick={() => handleScan()}
                    disabled={isScanning || !qrCode.trim()}
                  >
                    {isScanning ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">
                          {accessType === 'entry' ? '📥' : '📤'}
                        </span>
                        {accessType === 'entry' ? 'Registrar Entrada' : 'Registrar Salida'}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Último escaneo */}
            {lastScan && (
              <div className="mb-8">
                <div className="max-w-md mx-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Último registro:</h4>
                  <div className={`p-6 rounded-xl border-2 shadow-lg ${
                    lastScan.type === 'entry' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`flex items-center gap-2 font-bold text-lg ${
                        lastScan.type === 'entry' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <span className="text-2xl">
                          {lastScan.type === 'entry' ? '📥' : '📤'}
                        </span>
                        {lastScan.type === 'entry' ? 'Entrada' : 'Salida'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {lastScan.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{lastScan.message}</p>
                    {lastScan.access_log && (
                      <div className="text-xs text-gray-500">
                        ID de registro: {lastScan.access_log.id}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ayuda adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Consejos útiles:
              </h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Asegúrate de que el código QR esté completamente visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Mantén la cámara estable para mejor escaneo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>El código QR cambia cada 5 minutos por seguridad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Si tienes problemas, contacta al administrador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Recuerda registrar tanto tu entrada como tu salida</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;