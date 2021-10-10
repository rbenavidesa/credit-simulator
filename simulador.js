$(function(){   
    class CreditSimulation{
        
        constructor(requestedAmount, numberOfCreditInstallments, unit){
        
        this.requestedAmount = parseInt(requestedAmount);
        this.numberOfCreditInstallments = parseInt(numberOfCreditInstallments);
        this.creditUnits = unit;
        
        if(unit == 'USD' || unit == 'UF'){

            this.anuallytInterestRate = 0.05; // se asume una tasa menor descontando una inflación del 3% anual

        }

        else{

            this.anuallytInterestRate = 0.08;

        }
        
        this.taxesAndExpenditures;
        this.interest;
        this.totalCreditCost;
        this.installmentCost;
        }

        setTaxesAndExpenditures(requestedAmount){
            this.taxesAndExpenditures = parseFloat(0.0085 * requestedAmount).toFixed(2); // se asume que los impuestos se calculan en base al total solicitado    
        }

        setInterest(requestedAmount, numberOfCreditInstallments){
            this.interest = parseFloat((requestedAmount * ((1 + (this.anuallytInterestRate / 12)) ** numberOfCreditInstallments)) - requestedAmount).toFixed(2);
        }

        setTotalCreditCost(taxesAndExpenditures, interest){
            this.totalCreditCost = parseFloat(taxesAndExpenditures + interest).toFixed(2);
        }

        setinstallmentCost(totalCreditCost, numberOfCreditInstallments){
            this.installmentCost = parseFloat(totalCreditCost / numberOfCreditInstallments).toFixed(2);
        }

        simulateCredit(){
            this.setTaxesAndExpenditures(this.requestedAmount);
            this.setInterest(this.requestedAmount,this.numberOfCreditInstallments);
            this.setTotalCreditCost(this.taxesAndExpenditures, this.interest);
            this.setinstallmentCost(this.totalCreditCost, this.numberOfCreditInstallments);
        }
    }   

    $("#clp-simulation").click(function (e){

        e.preventDefault();

        let requestedAmount = requestCreditAmount();

        if (requestedAmount == null){
            return;
        }

        let numberOfCreditInstallments = requestNumberOfCreditInstallments();

        if(numberOfCreditInstallments == null){
            return;
        }

        // Borro mensajes de alerta previos en caso de existir
        removeNode("myAlert");

        let simulationData = JSON.stringify({"requestedAmount": requestedAmount, "numberOfCreditInstallments": numberOfCreditInstallments});

        localStorage.setItem("simulationData", simulationData);

        const creditSimulations = getCreditSimulations('CLP');

        printCreditSimulations(creditSimulations, 'CLP');

    });

    $("#usd-simulation").click(function (e){

        e.preventDefault();

        var usdToClp, dataDate;

        $.ajax({
            url: 'https://mindicador.cl/api',
            type: 'GET',
            timeout: 30000,
            fail: function(){
                
                console.log('Error al consumir la API!');
                return false;
            
            },
            success: function(data){ 
            
                return data;

            }
        }).done(function(response){

            if(response){

                usdToClp = parseInt(response.dolar.valor);

                if (usdToClp == null){
                    return;
                }

                let requestedAmount = requestCreditAmount();

                if (requestedAmount == null){
                    return;
                }

                let numberOfCreditInstallments = requestNumberOfCreditInstallments();

                if(numberOfCreditInstallments == null){
                    return;
                }

                requestedAmount = parseInt(requestedAmount / usdToClp);

                // Borro mensajes de alerta previos en caso de existir
                removeNode("myAlert");

                let simulationData = JSON.stringify({"requestedAmount": requestedAmount, "numberOfCreditInstallments": numberOfCreditInstallments});

                localStorage.setItem("simulationData", simulationData);

                const creditSimulations = getCreditSimulations('USD');

                printCreditSimulations(creditSimulations, 'USD');

            }

            else{
                console.log("error en la api");
            }

        });
    });

    $("#uf-simulation").click(function (e){

        e.preventDefault();

        var ufToClp, dataDate;

        $.ajax({
            url: 'https://mindicador.cl/api',
            type: 'GET',
            timeout: 30000,
            fail: function(){
                
                console.log('Error al consumir la API!');
                return false;
            
            },
            success: function(data){ 
            
                return data;

            }
        }).done(function(response){

            if(response){

                ufToClp = parseInt(response.uf.valor);

                if (ufToClp == null){
                    return;
                }

                let requestedAmount = requestCreditAmount();

                if (requestedAmount == null){
                    return;
                }

                let numberOfCreditInstallments = requestNumberOfCreditInstallments();

                if(numberOfCreditInstallments == null){
                    return;
                }

                requestedAmount = parseInt(requestedAmount / ufToClp);

                // Borro mensajes de alerta previos en caso de existir
                removeNode("myAlert");

                let simulationData = JSON.stringify({"requestedAmount": requestedAmount, "numberOfCreditInstallments": numberOfCreditInstallments});

                localStorage.setItem("simulationData", simulationData);

                const creditSimulations = getCreditSimulations('UF');

                printCreditSimulations(creditSimulations, 'UF');

            }

            else{
                console.log("error en la api");
            }

        });
    });

    // La siguiente función valida que un string es un número natural mayor a 0
    function isNaturalNumber(n) {
        n = n.toString(); 
        var n1 = Math.abs(n),
        n2 = parseInt(n, 10);
        return !isNaN(n1) && n2 === n1 && n1.toString() === n;
    }

    function requestCreditAmount(){

        let requestedAmount = $("#requestedAmount").val();

        if(requestedAmount == null){

            insertAlert('El monto solicitado es un parámetro necesario para simular tu crédito, intenta nuevamente. Si deseas cancelar la simulación cierra la pestaña del navegador.');
            return null;
        }

        // Reviso si se ingresó un valor numérico, si no lo es le informo al usuario y pido que vuelta a ingresar un valor
        if(!isNaturalNumber(requestedAmount)){

            insertAlert('El monto solicitados es inválido. Debes ingresar un valor númerico natural mayor a 0, intenta nuevamente.');
            return null;
        }
        // Ahora que sé que el monto solicitado es un numero natural mayor a 0 lo parseo a int y retorno el valor
        return parseInt(requestedAmount);
    }

    function requestNumberOfCreditInstallments(){

        // Solicito la cantidad de cuota solicitadas
        let numberOfCreditInstallments = $("#numberOfCreditInstallments").val();

        if(numberOfCreditInstallments == null){

            insertAlert('El número de cuotas mensualres requeridas es un parámetro necesario para simular tu crédito, intenta nuevamente. Si deseas cancelar la simulación cierra la pestaña del navegador.');
            return null;
        }

        // Reviso si se ingresó un valor numérico, si no lo es le informo al usuario y pido que vuelta a ingresar un valor
        if(!isNaturalNumber(numberOfCreditInstallments)){
            
            insertAlert('El número de cuotas mensualres requeridas es inválido. Debes ingresar un valor númerico natural mayor a 0, intenta nuevamente.');
            return null;
        }

        // Reviso si la cantidad de cuotas mensuales supera las 600, equivalente a 50 años
        if(numberOfCreditInstallments > 50){
            
            insertAlert('El número de cuotas mensuales no puede superar 600, la institución no entrega créditos por más de 50 años.');
            return null;
        }

        // Ahora que sé que el monto solicitado es un numero natural mayor a 0 lo parseo a int y retorno la variable
        return parseInt(numberOfCreditInstallments);

    }

    function getCreditSimulations(unit){

        // Defino mi objeto de simulacion de crédito y ejecuto los diferentes cálculos asociados al crédito
        const simulationData = JSON.parse(localStorage.getItem('simulationData'));

        const creditSimulation1 = new CreditSimulation(parseInt(simulationData.requestedAmount), parseInt(simulationData.numberOfCreditInstallments), unit);
        creditSimulation1.simulateCredit();

        const creditSimulation2 = new CreditSimulation(parseInt(simulationData.requestedAmount) * 0.5, parseInt(simulationData.numberOfCreditInstallments), unit);
        creditSimulation2.simulateCredit();

        const creditSimulation3 = new CreditSimulation(parseInt(simulationData.requestedAmount), parseInt((simulationData.numberOfCreditInstallments * 2)), unit);
        creditSimulation3.simulateCredit();

        const creditSimulations = [];

        creditSimulations.push(creditSimulation1);
        creditSimulations.push(creditSimulation2);
        creditSimulations.push(creditSimulation3);

        return creditSimulations;
    }

    function printCreditSimulations(creditSimulations, unit){

        // Elimino simulaciones pasadas en caso de existir
        removeNode("myDiv");

        // Construyo el mensaje asociado a la simulación
        var finalMessage = '<div id="myDiv" class="container"><h2>Alternativas de crédito disponibles</h2>';
        var i = 0;
        
        for(const creditSimulation of creditSimulations){
            finalMessage += `<h3 class="text-muted">Información del crédito simulado: Opción ${++i}</h3>
                            <dl class="row">
                                <dt class="col-sm-3">Monto a recibir:</dt> <dd class="col-sm-9">${Number(creditSimulation.requestedAmount).toLocaleString('es') + ' ' + unit}</dd>
                                <dt class="col-sm-3">Número de cuotas mensuales:</dt> <dd class="col-sm-9">${Number(creditSimulation.numberOfCreditInstallments).toLocaleString('es')}</dd>
                                <dt class="col-sm-3">Impuestos e intereses:</dt> <dd class="col-sm-9">${Number(creditSimulation.taxesAndExpenditures).toLocaleString('es') + ' ' + unit}</dd>
                                <dt class="col-sm-3">Valor cuota:</dt> <dd class="col-sm-9">${Number(creditSimulation.installmentCost).toLocaleString('es') + ' ' + unit}</dd>
                                <dt class="col-sm-3">Monto total del crédito:</dt> <dd class="col-sm-9">${Number(creditSimulation.totalCreditCost).toLocaleString('es') + ' ' + unit}</dd>
                            </dl>`;
        }

        

        finalMessage += `<div class="form-group row">
                            <div class="col-sm-10">
                                <button id="download" class="btn btn-primary">Descargar en PDF</button>     
                            </div>
                        </div></div>`;
        
        // Inserto las simulaciones luego del formulario
        insertAfter('myContainer', finalMessage);

    }

    function insertAfter(referenceId, newNode) {
        $("#" + referenceId).after(newNode).show("slow");
    }

    function removeNode(id){
        let myNode = $("#" + id);

        if(myNode != null){
            myNode.remove();
        }
    }

    function insertAlert(errorMessage){
        
        // Borro mensajes de alerta previos en caso de existir
        removeNode("myAlert");
        // Construyo el html de la alerta y la inserto en el dom
        var alert = `<div id="myAlert" class="alert alert-danger fade in"><strong>Hay un error en los datos ingresados!</strong> ${errorMessage}</div>`;
        insertAfter('formInstrucctions', alert);
    }

    $("body").on("click", "#download", function(){
        console.log("nnolasdf");
        generatePDF();
    });

    function generatePDF() {
        var doc = new jsPDF();  //create jsPDF object
        doc.fromHTML(document.getElementById("myDiv"), // page element which you want to print as PDF
        15,
        15, 
        {
        'width': 170  //set width
        },
        function(a) 
        {
        doc.save("HTML2PDF.pdf"); // save file name as HTML2PDF.pdf
        });
    }
    
});


