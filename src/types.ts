export interface Maquina {
  id: string;
  instalacionid: string;
  idm: string;
  idc: string;
  tipo: string;
  marca: string;
  modelo: string;
  nserie: string;
  anno: string;
}

export interface Instalacion {
  id: string;
  nombre: string;
  clienteid: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  email: string;
  telefono: string;
}
export interface Protocolo {
  id: string;
  nombre: string;
  acciones: string[];
}
