export interface ProgressSchema {

    //pliegues
    pliegues_Tricipital: number,
    pliegues_Subescapular: number,
    pliegues_Bicipital: number,
    pliegues_Cresta_ilíaca : number,
    pliegues_Supraespinal: number,
    pliegues_Abdominal: number,
    pliegues_Muslo: number,
    pliegues_Pantorrilla: number,

    //perimetros
   
    perimetros_cintura: string,
    perimetros_abdomen: string,
    perimetros_cadera: string,
    perimetros_brazo_contraido: string,
    perimetros_muslo: string,
    perimetros_pantorrilla: string,
    //resultados

    resultados_peso: string,
    resultados_grasa_corporal: string,
    resultados_kg_grasa: string,
    resultados_kg_musculo: string,
    resultados_suma_pliegues: number

}

    