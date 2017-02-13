/*
Depends of vue.js framework
*/
var payment = new Vue({
    el: '#cart_payment_type',
    data: {
        types: [],
        payment_type: '',
        card: {
            brand: '',
            installments: [],
            installmentQuantity: 0,
            installmentValue: 0,
        },
        amount: 0,
        type: ''
    },
    delimiters: ["[[","]]"],
    methods: {
        pagseguroStaticUrl: function(url) {
            return  'https://stc.pagseguro.uol.com.br' + url;
        },
        collapseId: function(name) {
            return 'collapse_' + name;
        },
        collapseIdHref: function(name) {
            return '#' + this.collapseId(name);
        },
        paymentActive: function(name) {
            return name == this.payment_type;
        }
    },
});
function toArray(dict) {
    result = [];
    var i, v;
    jQuery.each(dict, function(i, v) {
        result.push(v);
    });
    return result;
}
function pagseguro_payment_params() {
    data = {
        paymentMode: 'default',
    }
    switch (payment.type) {
        case 'BOLETO':
            data['paymentMethod'] = 'boleto';
            break;
        case 'CREDIT_CARD':
            data['paymentMethod'] = 'creditCard';
            data['creditCardToken'] = payment.card.token;
            data['installmentQuantity'] = payment.card.installmentsQuantity;
            data['installmentValue'] = payment.card.installmentValue;
            /*data['creditCardHolderName'] = 
&creditCardHolderCPF=11475714734\
&creditCardHolderBirthDate=01/01/1900\
&creditCardHolderAreaCode=99\
&creditCardHolderPhone=99999999\*/
    }
}
function preparePaymentMethods(dict) {
    var mapNames = {
        'BOLETO': 'Boleto Bancário',
        'ONLINE_DEBIT': 'Débito Online',
        'CREDIT_CARD': 'Cartão de Crédito',
        'BALANCE': 'Saldo PagSeguro',
        'DEPOSIT': 'Depósito'
    }
    result = [];
    var i, v;
    jQuery.each(dict, function(i, v) {
        v.displayName = mapNames[v.name];
        if (v.name != 'BALANCE' && v.name != 'DEPOSIT')
            result.push(v);
    });
    return result;
}
function payment_init_card_form() {
    var card = new Card({
        // a selector or DOM element for the form where users will
        // be entering their information
        form: '#card-form', // *required*
        // a selector or DOM element for the container
        // where you want the card to appear
        container: '.card-wrapper', // *required*

        // if true, will log helpful messages for setting up Card
        debug: true // optional - default false
    });
}
function pagseguro_get_brand(number, success_add) {
    number = number.replace(' ', '').substring(0,6);
    if (number.length < 6) {
        console.log(number + ' tem menos de 6 caracteres');
        return;   
    }
    PagSeguroDirectPayment.getBrand({
        cardBin: number,
        success: function(response) {
            payment.card.brand = response.brand.name;
            success_add(response);
        },
        error: function(response) {
            console.log("Erro ao receber a bandeira do cartão");
            console.log(response);
        },
        complete: function(response) {
            
        }
    });
}
function pagseguro_get_installments(amount, brand, success_add) {
    PagSeguroDirectPayment.getInstallments({
        amount: amount,
        brand: brand,
        maxInstallmentNoInterest: 10,
        success: function(response) {
            payment.card.installments = response.installments;
            success_add(response);
        },
        error: function(response) {
            console.log("Ocorreu erro ao recuperar as parcelas");
            console.log(response);  
        },
        complete: function(response) {

        }
    });
}
$(document).ready(function() {
    payment.amount = 500;
    waitingDialog.show('Carregando as formas de Pagamento...');
    PagSeguroDirectPayment.setSessionId(pagseguro_session_id);
    PagSeguroDirectPayment.getPaymentMethods({
        amount: payment.amount,
        success: function(response) {
            payment.types = preparePaymentMethods(response.paymentMethods);
            setTimeout(payment_init_card_form, 1000);
        },
        error: function(response) {
            console.log(response);
        },
        complete: function(response) {
            waitingDialog.hide();
        }
    });
    $(document).on('click', '.payment_type_item_option', function(e) {
        e.preventDefault();
        payment.payment_type = $(this).attr('data-name');
        $('input[name=payment_method]').each(function(i, v) {
            if ($(this).val() == payment.payment_type) {
                $(this).attr('selected', 'selected');
                return false;
            }
        });
    });
    $(document).on('blur', '#card-form input[name=number]', function(e) {
        if ($(this).val() != '') {
            var number = $(this).val();
            pagseguro_get_brand(number, function(response) {
                pagseguro_get_installments(payment.amount, response.brand.name, function(response) {

                });
            })
        }
    });
});