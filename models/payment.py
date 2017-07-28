from .config import Config
import requests
from xml.etree import ElementTree
from .i18n import _

class PagseguroException(Exception):
    """
    Exceção padrão para identificação de problemas de comunicação
    com a API PagSeguro
    """
    pass

class Payment(object):
    config = Config()
    sandbox = config.PAGSEGURO_SANDBOX
    session_id = None
    email = config.PAGSEGURO_EMAIL
    token = config.PAGSEGURO_TOKEN

    def __init__(self):
        self.init()
        
    def init_url(self):
        """
        Retorna a url conforme ambiente
        """
        if self.sandbox:
            return 'https://ws.sandbox.pagseguro.uol.com.br/v2/sessions'
        else:
            return 'https://ws.pagseguro.uol.com.br/v2/sessions'

    def init(self):
        """
        Init para pagamento transparente
        """
        result = requests.post(self.init_url(), data={'email':self.email, 'token':self.token})
        if result.status_code == 200:
            session = ElementTree.fromstring(result.text)
            self.session_id = session.find('id').text
        else:
            raise PagseguroException(_('Error geting session from PagSeguro'))

    def javascript_url(self):
        """
        Retorna a url do javascript para pagamento transparente
        """
        if self.sandbox:
            return 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
        else:
            return 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'

    def javascript(self):
        """
        Retorna html com chamadas javascript auxiliares
        para o funcionamento do pagamento transparente
        """
        string = '<script type="text/javascript" src="{}"></script>'.format(self.javascript_url())
        string += '<script type="text/javascript">pagseguro_session_id="{}";</script>'.format(self.session_id)
        return string