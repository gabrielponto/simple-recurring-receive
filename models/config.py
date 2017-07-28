import settings

class Config(object):
    def __getattribute__(self, name):
        return getattr(settings, name)
