from cx_Freeze import setup, Executable

setup(

    name="Générateur de sommaire",

    version="1.0",

    description="Générer le sommaire d'un plan réalisé sur AutoCAD",

    executables=[Executable("main.py")],

)   