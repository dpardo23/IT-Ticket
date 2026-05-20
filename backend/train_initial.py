from core.nlp_processor import clean_text
from core.storage import append_to_master_dataset, load_master_dataset
from core.constants import DEPARTMENTS


DUMMY_DATA = [
    ("reseteo de contraseña no puedo acceder usuario bloqueado", "SecOps / IAM"),
    ("permisos de firewall VPN denegada token de seguridad", "SecOps / IAM"),
    ("mi cuenta de correo fue suspendida por intentos fallidos", "SecOps / IAM"),
    ("necesito acceso a la carpeta compartida de finanzas", "SecOps / IAM"),
    ("alerta de antivirus malware detectado en mi equipo", "SecOps / IAM"),
    ("desbloquear cuenta del active directory urgente", "SecOps / IAM"),
    ("crear credenciales para nuevo empleado onboarding", "SecOps / IAM"),
    ("renovar certificado ssl de la intranet que expiro", "SecOps / IAM"),

    ("servidor linux caido centos almacenamiento lleno disco", "SysAdmins"),
    ("backup fallido recuperar base de datos aws azure", "SysAdmins"),
    ("reiniciar maquina virtual en vmware hipervisor", "SysAdmins"),
    ("actualizar parches de seguridad en windows server", "SysAdmins"),
    ("migracion de contenedor docker caida del cluster", "SysAdmins"),
    ("restaurar snapshot de la maquina de contabilidad", "SysAdmins"),
    ("el servidor web apache arroja error 502 bad gateway", "SysAdmins"),

    ("cable de red roto switch sin conexion wifi lento", "NetOps"),
    ("telefonia ip no funciona router apagado", "NetOps"),
    ("configurar extension sip en la pbx issabel", "NetOps"),
    ("no hay salida a internet caida del enlace principal", "NetOps"),
    ("asignar ip estatica a nueva impresora de red", "NetOps"),
    ("latencia alta en la vpn troncal de fibra optica", "NetOps"),
    ("crear nueva vlan para el departamento de ventas", "NetOps"),
    ("el telefono asterisk no registra la extension", "NetOps"),

    ("laptop no enciende cambiar teclado mouse roto", "Microinformática"),
    ("impresora atascada no saca copias ni escanea", "Microinformática"),
    ("pantalla parpadea monitor dañado pedir reemplazo", "Microinformática"),
    ("instalar paquete de microsoft office en pc nueva", "Microinformática"),
    ("bateria de la laptop no carga se apaga de golpe", "Microinformática"),
    ("el proyector de la sala de reuniones no da video", "Microinformática"),
    ("actualizar drivers de tarjeta grafica", "Microinformática"),
    ("necesito un adaptador hdmi a vga urgente", "Microinformática"),

    ("error en codigo de produccion bug base de datos sql", "DevOps"),
    ("el sistema erp lanza una excepcion null pointer", "DevOps"),
    ("fallo en el pipeline de despliegue ci cd github actions", "DevOps"),
    ("optimizar query de postgresql que esta muy lenta", "DevOps"),
    ("la api de pagos esta devolviendo timeout 504", "DevOps"),
    ("corregir error de renderizado en el frontend react", "DevOps"),
    ("revisar logs de la aplicacion de recursos humanos", "DevOps"),

    ("solicitud de nuevo monitor ayuda general", "Mesa de Servicios"),
    ("como configuro mi firma en el correo de outlook", "Mesa de Servicios"),
    ("donde descargo el manual de uso del sistema", "Mesa de Servicios"),
    ("solicito licencia de adobe illustrator para diseño", "Mesa de Servicios"),
    ("duda sobre como agendar vacaciones en el portal", "Mesa de Servicios"),
    ("necesito prestamo de equipo para viaje de negocios", "Mesa de Servicios"),
    ("no encuentro el formulario de viaticos", "Mesa de Servicios")
]


def bootstrap_master_dataset():
    """
    Crea dataset_master.csv si no existe.
    """
    df = load_master_dataset()

    if len(df) > 0:
        print("[BOOTSTRAP] Dataset master ya existe. No se modificará.")
        return

    print("[BOOTSTRAP] Creando dataset_master.csv inicial con dummy data...")

    for text, dept in DUMMY_DATA:
        cleaned = clean_text(text)
        if cleaned and dept in DEPARTMENTS:
            append_to_master_dataset(cleaned, dept)

    print("[BOOTSTRAP] Dataset master creado con éxito.")


if __name__ == "__main__":
    bootstrap_master_dataset()