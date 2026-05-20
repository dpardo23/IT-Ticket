import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from core.nlp_processor import clean_text
from core.mnb_model import DEPARTMENTS, MODEL_DIR, VECTORIZER_PATH, MODEL_PATH

# 45 tickets de soporte técnico realistas para calibrar los tensores MNB iniciales
DUMMY_DATA = [
    # SecOps / IAM (Accesos, Seguridad, Identidad)
    ("reseteo de contraseña no puedo acceder usuario bloqueado", "SecOps / IAM"),
    ("permisos de firewall VPN denegada token de seguridad", "SecOps / IAM"),
    ("mi cuenta de correo fue suspendida por intentos fallidos", "SecOps / IAM"),
    ("necesito acceso a la carpeta compartida de finanzas", "SecOps / IAM"),
    ("alerta de antivirus malware detectado en mi equipo", "SecOps / IAM"),
    ("desbloquear cuenta del active directory urgente", "SecOps / IAM"),
    ("crear credenciales para nuevo empleado onboarding", "SecOps / IAM"),
    ("renovar certificado ssl de la intranet que expiro", "SecOps / IAM"),

    # SysAdmins (Servidores, SO, Backups, Nube)
    ("servidor linux caido centos almacenamiento lleno disco", "SysAdmins"),
    ("backup fallido recuperar base de datos aws azure", "SysAdmins"),
    ("reiniciar maquina virtual en vmware hipervisor", "SysAdmins"),
    ("actualizar parches de seguridad en windows server", "SysAdmins"),
    ("migracion de contenedor docker caida del cluster", "SysAdmins"),
    ("restaurar snapshot de la maquina de contabilidad", "SysAdmins"),
    ("el servidor web apache arroja error 502 bad gateway", "SysAdmins"),

    # NetOps (Redes, Switches, Telefonía, Conectividad)
    ("cable de red roto switch sin conexion wifi lento", "NetOps"),
    ("telefonia ip no funciona router apagado", "NetOps"),
    ("configurar extension sip en la pbx issabel", "NetOps"),
    ("no hay salida a internet caida del enlace principal", "NetOps"),
    ("asignar ip estatica a nueva impresora de red", "NetOps"),
    ("latencia alta en la vpn troncal de fibra optica", "NetOps"),
    ("crear nueva vlan para el departamento de ventas", "NetOps"),
    ("el telefono asterisk no registra la extension", "NetOps"),

    # Microinformática (Hardware local, periféricos, ofimática)
    ("laptop no enciende cambiar teclado mouse roto", "Microinformática"),
    ("impresora atascada no saca copias ni escanea", "Microinformática"),
    ("pantalla parpadea monitor dañado pedir reemplazo", "Microinformática"),
    ("instalar paquete de microsoft office en pc nueva", "Microinformática"),
    ("bateria de la laptop no carga se apaga de golpe", "Microinformática"),
    ("el proyector de la sala de reuniones no da video", "Microinformática"),
    ("actualizar drivers de tarjeta grafica", "Microinformática"),
    ("necesito un adaptador hdmi a vga urgente", "Microinformática"),

    # DevOps (Software interno, Bugs, Bases de Datos, Código)
    ("error en codigo de produccion bug base de datos sql", "DevOps"),
    ("el sistema erp lanza una excepcion null pointer", "DevOps"),
    ("fallo en el pipeline de despliegue ci cd github actions", "DevOps"),
    ("optimizar query de postgresql que esta muy lenta", "DevOps"),
    ("la api de pagos esta devolviendo timeout 504", "DevOps"),
    ("corregir error de renderizado en el frontend react", "DevOps"),
    ("revisar logs de la aplicacion de recursos humanos", "DevOps"),

    # Mesa de Servicios (Solicitudes generales, dudas, nivel 0/1)
    ("solicitud de nuevo monitor ayuda general", "Mesa de Servicios"),
    ("como configuro mi firma en el correo de outlook", "Mesa de Servicios"),
    ("donde descargo el manual de uso del sistema", "Mesa de Servicios"),
    ("solicito licencia de adobe illustrator para diseño", "Mesa de Servicios"),
    ("duda sobre como agendar vacaciones en el portal", "Mesa de Servicios"),
    ("necesito prestamo de equipo para viaje de negocios", "Mesa de Servicios"),
    ("no encuentro el formulario de viaticos", "Mesa de Servicios")
]

def bootstrap_model():
    print("Iniciando entrenamiento base (Ignición MNB)...")
    
    texts = [clean_text(item[0]) for item in DUMMY_DATA]
    labels = [item[1] for item in DUMMY_DATA]
    
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    X_train = vectorizer.fit_transform(texts)
    
    classifier = MultinomialNB(alpha=0.1)
    classifier.fit(X_train, labels)
    
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(classifier, MODEL_PATH)
    print(f"Éxito: Matriz guardada en /{MODEL_DIR}. Vocabulario inicial: {len(vectorizer.get_feature_names_out())} tokens únicos.")

if __name__ == "__main__":
    bootstrap_model()